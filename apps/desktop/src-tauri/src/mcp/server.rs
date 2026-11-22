//! The MCP tools. They know nothing about résumés: each one checks its
//! arguments and asks the page.

use super::args::{
    Check, CreateResumeArgs, DuplicateResumeArgs, EditResumeArgs, ExportResumeArgs, GetResumeArgs,
    ProfileIdArgs, ReplaceResumeArgs, ResumeIdArgs, ResumeSettingsArgs, SaveProfileArgs,
    SectionOrderArgs, SetPhotoArgs,
};
use super::bridge::{Bridge, PERSON_TIMEOUT};
use super::photo::read_photo;
use rmcp::handler::server::router::tool::ToolRouter;
use rmcp::handler::server::wrapper::Parameters;
use rmcp::model::{CallToolResult, ContentBlock, Implementation, ServerCapabilities, ServerConfig};
use rmcp::service::RequestContext;
use rmcp::{tool, tool_handler, tool_router, RoleServer, ServerHandler};
use serde::Serialize;
use serde_json::Value;
use std::sync::Arc;

const INSTRUCTIONS: &str = "Lanjut is a résumé builder on this device. \
Call lanjut_list_resumes for the résumés of the active profile, and lanjut_get_resume \
to read one as Markdown with its revision, its section ids, and the templates and fonts. \
To change the text, call lanjut_edit_resume for exact replacements, or lanjut_replace_resume \
for the full text. To change the look, call lanjut_update_resume_settings, \
lanjut_set_section_order, or lanjut_set_photo. Every write takes the revision that you read \
as base_revision and gives the next one. Each write is one undo step in Lanjut, and the \
person sees it. If a write says that the résumé changed, read it again before you write. \
Profiles hold a person's details for one kind of job: lanjut_list_profiles, \
lanjut_switch_profile, and lanjut_save_profile. A delete and an export wait for the \
person to answer in Lanjut.";

#[derive(Clone)]
pub struct LanjutMcp {
    bridge: Arc<Bridge>,
    version: String,
    tool_router: ToolRouter<Self>,
}

fn failure(message: impl Into<String>) -> CallToolResult {
    CallToolResult::error(vec![ContentBlock::text(message)])
}

fn reply(result: Result<Value, String>) -> CallToolResult {
    match result {
        Ok(value) => CallToolResult::success(vec![ContentBlock::text(value.to_string())]),
        Err(message) => failure(message),
    }
}

/// The text goes in a block of its own, so the model copies `old_str` from it
/// as it is, not from an escaped JSON string.
fn resume_text(mut value: Value) -> CallToolResult {
    let text = value
        .as_object_mut()
        .and_then(|object| object.remove("text"))
        .and_then(|text| text.as_str().map(str::to_owned));
    match text {
        Some(text) => CallToolResult::success(vec![
            ContentBlock::text(value.to_string()),
            ContentBlock::text(text),
        ]),
        None => failure("Lanjut gave no text for this résumé."),
    }
}

/// The longest client name that the page shows.
const MAX_CLIENT_NAME: usize = 60;

/// What the assistant calls itself, for the mark in the editor. The client
/// sends it in each request, or once at `initialize`.
fn client_name(context: &RequestContext<RoleServer>) -> Option<String> {
    let info = context.client_info()?;
    let name = info.title.unwrap_or(info.name);
    let name: String = name.trim().chars().take(MAX_CLIENT_NAME).collect();
    (!name.is_empty()).then_some(name)
}

#[tool_router]
impl LanjutMcp {
    pub fn new(bridge: Arc<Bridge>, version: String) -> Self {
        Self {
            bridge,
            version,
            tool_router: Self::tool_router(),
        }
    }

    async fn ask<A: Check + Serialize>(
        &self,
        tool: &'static str,
        args: &A,
        context: &RequestContext<RoleServer>,
    ) -> Result<Value, String> {
        args.check()?;
        let args = serde_json::to_value(args).map_err(|error| error.to_string())?;
        self.bridge
            .call(tool, args, client_name(context))
            .await
            .map_err(|error| error.to_string())
    }

    async fn ask_person<A: Check + Serialize>(
        &self,
        tool: &'static str,
        args: &A,
        context: &RequestContext<RoleServer>,
    ) -> Result<Value, String> {
        args.check()?;
        let args = serde_json::to_value(args).map_err(|error| error.to_string())?;
        self.bridge
            .call_waiting(tool, args, client_name(context), PERSON_TIMEOUT)
            .await
            .map_err(|error| error.to_string())
    }

    #[tool(
        description = "Gives the title, id, and last change of each résumé in the active Lanjut profile, newest first.",
        annotations(title = "List résumés", read_only_hint = true, open_world_hint = false)
    )]
    async fn lanjut_list_resumes(&self, context: RequestContext<RoleServer>) -> CallToolResult {
        let call = self
            .bridge
            .call("lanjut_list_resumes", Value::Null, client_name(&context));
        match call.await {
            Ok(value) => CallToolResult::success(vec![ContentBlock::text(value.to_string())]),
            Err(error) => failure(error.to_string()),
        }
    }

    #[tool(
        description = "Gives one résumé as text. The first block holds the id, the title, the revision, \
and the format. The second block is the text. Markdown is the default: a `#` heading with the name, \
`Label: value` lines, a `##` heading for each section, and a `###` heading for each entry. \
Keep the headings and the labels as the text gives them. The text never holds the photo. \
The first block also lists the sections with their ids, and the template and font ids. \
Give `revision` as `base_revision` to a write.",
        annotations(
            title = "Read a résumé",
            read_only_hint = true,
            open_world_hint = false
        )
    )]
    async fn lanjut_get_resume(
        &self,
        Parameters(args): Parameters<GetResumeArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        match self.ask("lanjut_get_resume", &args, &context).await {
            Ok(value) => resume_text(value),
            Err(message) => failure(message),
        }
    }

    #[tool(
        description = "Changes a résumé by exact replacements on the Markdown that lanjut_get_resume gives. \
Each `old_str` must occur exactly once in the text: add more of the lines around it if it occurs more \
than once. The edits apply in order, all or none, as one undo step. Lanjut opens the résumé in its window, \
so the person sees the change. Refuses when the résumé changed after `base_revision`: read it again. \
Gives the new revision.",
        annotations(
            title = "Edit a résumé",
            read_only_hint = false,
            destructive_hint = false,
            idempotent_hint = false,
            open_world_hint = false
        )
    )]
    async fn lanjut_edit_resume(
        &self,
        Parameters(args): Parameters<EditResumeArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        match self.ask("lanjut_edit_resume", &args, &context).await {
            Ok(value) => CallToolResult::success(vec![ContentBlock::text(value.to_string())]),
            Err(message) => failure(message),
        }
    }

    #[tool(
        description = "Replaces the full text of a résumé with new Markdown, in the dialect that \
lanjut_get_resume gives. The template, the colors, the language, and the photo stay. One undo step. \
Lanjut opens the résumé in its window, so the person sees the change. Prefer lanjut_edit_resume for a \
small change. Refuses when the résumé changed after `base_revision`: read it again. Gives the new revision.",
        annotations(
            title = "Replace a résumé",
            read_only_hint = false,
            destructive_hint = true,
            idempotent_hint = true,
            open_world_hint = false
        )
    )]
    async fn lanjut_replace_resume(
        &self,
        Parameters(args): Parameters<ReplaceResumeArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        match self.ask("lanjut_replace_resume", &args, &context).await {
            Ok(value) => CallToolResult::success(vec![ContentBlock::text(value.to_string())]),
            Err(message) => failure(message),
        }
    }

    #[tool(
        description = "Shows a résumé in the Lanjut window, in the editor. Changes no data.",
        annotations(
            title = "Show a résumé",
            read_only_hint = true,
            open_world_hint = false
        )
    )]
    async fn lanjut_open_resume(
        &self,
        Parameters(args): Parameters<ResumeIdArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        match self.ask("lanjut_open_resume", &args, &context).await {
            Ok(value) => CallToolResult::success(vec![ContentBlock::text(value.to_string())]),
            Err(message) => failure(message),
        }
    }
    #[tool(
        description = "Creates a résumé in the active profile and opens it in Lanjut. It starts blank \
or from the sample, with the header and the summary of the active profile. Gives the id and the revision.",
        annotations(
            title = "Create a résumé",
            read_only_hint = false,
            destructive_hint = false,
            idempotent_hint = false,
            open_world_hint = false
        )
    )]
    async fn lanjut_create_resume(
        &self,
        Parameters(args): Parameters<CreateResumeArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        reply(self.ask("lanjut_create_resume", &args, &context).await)
    }

    #[tool(
        description = "Copies a résumé in the active profile and opens the copy in Lanjut. Gives the id \
and the revision of the copy.",
        annotations(
            title = "Duplicate a résumé",
            read_only_hint = false,
            destructive_hint = false,
            idempotent_hint = false,
            open_world_hint = false
        )
    )]
    async fn lanjut_duplicate_resume(
        &self,
        Parameters(args): Parameters<DuplicateResumeArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        reply(self.ask("lanjut_duplicate_resume", &args, &context).await)
    }

    #[tool(
        description = "Asks the person to delete a résumé. Lanjut shows its delete dialog, and only the \
person can confirm. The call waits up to two minutes for the answer. If the person keeps the résumé, \
do not ask again unless they say so.",
        annotations(
            title = "Delete a résumé",
            read_only_hint = false,
            destructive_hint = true,
            idempotent_hint = true,
            open_world_hint = false
        )
    )]
    async fn lanjut_delete_resume(
        &self,
        Parameters(args): Parameters<ResumeIdArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        reply(
            self.ask_person("lanjut_delete_resume", &args, &context)
                .await,
        )
    }

    #[tool(
        description = "Changes the look of a résumé: the title, the template, the language of the \
headings and the dates, the font, the sizes, the spacing, the colors, and the contact icons. Also moves \
the résumé into another profile. Lanjut checks every value as the editor does: a color that is too light \
on white is refused. Leave out what stays. One undo step. Gives the new revision.",
        annotations(
            title = "Change the settings of a résumé",
            read_only_hint = false,
            destructive_hint = false,
            idempotent_hint = true,
            open_world_hint = false
        )
    )]
    async fn lanjut_update_resume_settings(
        &self,
        Parameters(args): Parameters<ResumeSettingsArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        reply(
            self.ask("lanjut_update_resume_settings", &args, &context)
                .await,
        )
    }

    #[tool(
        description = "Changes the order of the sections, with a preset or an exact order of the \
section ids that lanjut_get_resume gives, and hides or shows sections. The summary stays below the \
header. Entries keep their date order. One undo step. Gives the new revision.",
        annotations(
            title = "Order and show sections",
            read_only_hint = false,
            destructive_hint = false,
            idempotent_hint = true,
            open_world_hint = false
        )
    )]
    async fn lanjut_set_section_order(
        &self,
        Parameters(args): Parameters<SectionOrderArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        reply(self.ask("lanjut_set_section_order", &args, &context).await)
    }

    #[tool(
        description = "Sets the header photo from an image file on this device, or removes the photo \
when `path` is left out. Lanjut crops the image to a square and makes it small. The photo never comes \
back to you. One undo step. Gives the new revision.",
        annotations(
            title = "Set the photo",
            read_only_hint = false,
            destructive_hint = false,
            idempotent_hint = true,
            open_world_hint = false
        )
    )]
    async fn lanjut_set_photo(
        &self,
        Parameters(args): Parameters<SetPhotoArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        if let Err(message) = args.check() {
            return failure(message);
        }
        let image = match &args.path {
            Some(path) => match read_photo(path).await {
                Ok(image) => serde_json::to_value(image).unwrap_or(Value::Null),
                Err(message) => return failure(message),
            },
            None => Value::Null,
        };
        let page_args = serde_json::json!({
            "id": args.id,
            "base_revision": args.base_revision,
            "image": image,
        });
        let call = self
            .bridge
            .call("lanjut_set_photo", page_args, client_name(&context));
        reply(call.await.map_err(|error| error.to_string()))
    }

    #[tool(
        description = "Exports a résumé as PDF, DOCX, or TXT. Lanjut opens its save dialog, and the \
person picks where the file goes. The call waits up to two minutes for the answer.",
        annotations(
            title = "Export a résumé",
            read_only_hint = true,
            open_world_hint = false
        )
    )]
    async fn lanjut_export_resume(
        &self,
        Parameters(args): Parameters<ExportResumeArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        reply(
            self.ask_person("lanjut_export_resume", &args, &context)
                .await,
        )
    }

    #[tool(
        description = "Gives every profile: its id, name, whether it is active, how many résumés it \
holds, its revision, and its header and summary as Markdown. A new résumé starts with the header and \
the summary of the active profile.",
        annotations(
            title = "List profiles",
            read_only_hint = true,
            open_world_hint = false
        )
    )]
    async fn lanjut_list_profiles(&self, context: RequestContext<RoleServer>) -> CallToolResult {
        let call = self
            .bridge
            .call("lanjut_list_profiles", Value::Null, client_name(&context));
        reply(call.await.map_err(|error| error.to_string()))
    }

    #[tool(
        description = "Makes a profile the active one. lanjut_list_resumes then gives its résumés.",
        annotations(
            title = "Switch the profile",
            read_only_hint = false,
            destructive_hint = false,
            idempotent_hint = true,
            open_world_hint = false
        )
    )]
    async fn lanjut_switch_profile(
        &self,
        Parameters(args): Parameters<ProfileIdArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        reply(self.ask("lanjut_switch_profile", &args, &context).await)
    }

    #[tool(
        description = "Creates a profile when `id` is left out, and makes it active. With `id` and \
`base_revision`, changes the name, or the header and the summary as Markdown in the form that \
lanjut_list_profiles gives. A profile holds no other sections. Lanjut shows the profile on its \
Profiles page. Gives the new revision.",
        annotations(
            title = "Save a profile",
            read_only_hint = false,
            destructive_hint = false,
            idempotent_hint = false,
            open_world_hint = false
        )
    )]
    async fn lanjut_save_profile(
        &self,
        Parameters(args): Parameters<SaveProfileArgs>,
        context: RequestContext<RoleServer>,
    ) -> CallToolResult {
        reply(self.ask("lanjut_save_profile", &args, &context).await)
    }
}

#[tool_handler(router = self.tool_router)]
impl ServerHandler for LanjutMcp {
    fn get_info(&self) -> ServerConfig {
        ServerConfig::new(ServerCapabilities::builder().enable_tools().build())
            .with_server_info(Implementation::new("lanjut", &self.version).with_title("Lanjut"))
            .with_instructions(INSTRUCTIONS)
    }
}

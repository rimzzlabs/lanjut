//! The MCP tools. They know nothing about résumés: each one checks its
//! arguments and asks the page.

use super::args::{Check, EditResumeArgs, GetResumeArgs, ReplaceResumeArgs, ResumeIdArgs};
use super::bridge::Bridge;
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
to read one as Markdown with its revision. To change it, call lanjut_edit_resume for \
exact replacements, or lanjut_replace_resume for the full text, with that revision as \
base_revision. Each write is one undo step in Lanjut, and the person sees it. If a write \
says that the résumé changed, read it again before you write.";

#[derive(Clone)]
pub struct LanjutMcp {
    bridge: Arc<Bridge>,
    version: String,
    tool_router: ToolRouter<Self>,
}

fn failure(message: impl Into<String>) -> CallToolResult {
    CallToolResult::error(vec![ContentBlock::text(message)])
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
}

#[tool_handler(router = self.tool_router)]
impl ServerHandler for LanjutMcp {
    fn get_info(&self) -> ServerConfig {
        ServerConfig::new(ServerCapabilities::builder().enable_tools().build())
            .with_server_info(Implementation::new("lanjut", &self.version).with_title("Lanjut"))
            .with_instructions(INSTRUCTIONS)
    }
}

//! The arguments of the tools. serde and the schema check their shape, and
//! `check` adds the limits that a schema does not say. The page checks them
//! again, because it must not trust what reaches it.

use rmcp::schemars;
use serde::{Deserialize, Serialize};

/// A résumé of a few pages is under 20 000 characters. This leaves room.
const MAX_TEXT: usize = 200_000;
const MAX_EDITS: usize = 50;
const MAX_ID: usize = 128;

#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize, schemars::JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum TextFormat {
    #[default]
    Markdown,
    Yaml,
    Json,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct ResumeIdArgs {
    /// The id of the résumé, from lanjut_list_resumes.
    pub id: String,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct GetResumeArgs {
    /// The id of the résumé, from lanjut_list_resumes.
    pub id: String,
    /// The text format. Markdown is the default, and the only format that the
    /// write tools take. YAML and JSON also hold the settings.
    #[serde(default)]
    pub format: TextFormat,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct TextEdit {
    /// Text copied exactly from the Markdown. It must occur in it exactly once.
    pub old_str: String,
    /// The text that takes its place. Empty deletes it.
    pub new_str: String,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct EditResumeArgs {
    /// The id of the résumé, from lanjut_list_resumes.
    pub id: String,
    /// The revision that lanjut_get_resume or the last write gave.
    pub base_revision: u64,
    /// Applied in order, all or none. Each one sees the text that the ones
    /// before it left.
    pub edits: Vec<TextEdit>,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct ReplaceResumeArgs {
    /// The id of the résumé, from lanjut_list_resumes.
    pub id: String,
    /// The revision that lanjut_get_resume or the last write gave.
    pub base_revision: u64,
    /// The full résumé as Markdown, in the dialect that lanjut_get_resume gives.
    pub markdown: String,
}

const MAX_TITLE: usize = 120;
const MAX_LIST: usize = 50;

#[derive(Debug, Clone, Copy, Default, Serialize, Deserialize, schemars::JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum StartFrom {
    /// An empty résumé, with the header and the summary of the active profile.
    #[default]
    Blank,
    /// The sample résumé in the app's language, with the active profile's header and summary.
    Sample,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct CreateResumeArgs {
    /// The name of the résumé in the library.
    pub title: String,
    #[serde(default)]
    pub start: StartFrom,
    /// A template id from the `options` that lanjut_get_resume gives. The default is "awal".
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub template: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct DuplicateResumeArgs {
    /// The id of the résumé to copy, from lanjut_list_resumes.
    pub id: String,
    /// The name of the copy. The default is the old name with "(copy)".
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, schemars::JsonSchema)]
#[serde(rename_all = "lowercase")]
pub enum ExportFormat {
    Pdf,
    Docx,
    Txt,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct ExportResumeArgs {
    /// The id of the résumé, from lanjut_list_resumes.
    pub id: String,
    pub format: ExportFormat,
    /// The file name that the save dialog suggests, without the extension.
    /// The default is the title of the résumé.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub file_name: Option<String>,
}

#[derive(Debug, Default, Serialize, Deserialize, schemars::JsonSchema)]
pub struct ResumeColors {
    /// `#rrggbb` for the name. Each color must have a contrast of 4.5:1 or more on white.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// `#rrggbb` for the section headings.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub heading: Option<String>,
    /// `#rrggbb` for the rules. A rule needs a contrast of 3:1 or more on white.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub rule: Option<String>,
    /// `#rrggbb` for the links.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub link: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, schemars::JsonSchema)]
#[serde(rename_all = "snake_case")]
pub enum ResettableSetting {
    Font,
    LineHeight,
    NameScale,
    TitleScale,
    BodyScale,
    NameColor,
    HeadingColor,
    RuleColor,
    LinkColor,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct ResumeSettingsArgs {
    /// The id of the résumé, from lanjut_list_resumes.
    pub id: String,
    /// The revision that lanjut_get_resume or the last write gave.
    pub base_revision: u64,
    /// The name of the résumé in the library.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title: Option<String>,
    /// A template id from `options.templates`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub template: Option<String>,
    /// The language of the headings and the dates: "en", "id", or "fr". The text does not change.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub language: Option<String>,
    /// A font id from `options.fonts`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub font: Option<String>,
    /// Icons beside the contact details.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub show_icons: Option<bool>,
    /// Extra space between sections in px, from -24 to 60. 0 is the template's space.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub section_spacing: Option<i32>,
    /// Letter spacing in px, from -0.5 to 0.5.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub letter_spacing: Option<f64>,
    /// Line height, from 1.2 to 2.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub line_height: Option<f64>,
    /// Size of the name, from 0.8 to 1.2 of the template's size.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name_scale: Option<f64>,
    /// Size of the headings, from 0.8 to 1.2.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub title_scale: Option<f64>,
    /// Size of the body text, from 0.8 to 1.2.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub body_scale: Option<f64>,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub colors: Option<ResumeColors>,
    /// Settings that go back to the template's default.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub reset: Vec<ResettableSetting>,
    /// Moves the résumé into this profile, from lanjut_list_profiles.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub profile_id: Option<String>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, schemars::JsonSchema)]
#[serde(rename_all = "kebab-case")]
pub enum OrderPreset {
    /// The usual order: experience before skills.
    ExperienceFirst,
    /// Skills directly below the summary, for a skills-led résumé.
    SkillsFirst,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct SectionOrderArgs {
    /// The id of the résumé, from lanjut_list_resumes.
    pub id: String,
    /// The revision that lanjut_get_resume or the last write gave.
    pub base_revision: u64,
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub preset: Option<OrderPreset>,
    /// Every movable section id, in the new order. Not with `preset`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub order: Option<Vec<String>>,
    /// Section ids to hide from the page and every export. The text stays.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub hidden: Vec<String>,
    /// Section ids to show again.
    #[serde(default, skip_serializing_if = "Vec::is_empty")]
    pub shown: Vec<String>,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct SetPhotoArgs {
    /// The id of the résumé, from lanjut_list_resumes.
    pub id: String,
    /// The revision that lanjut_get_resume or the last write gave.
    pub base_revision: u64,
    /// The absolute path of a JPEG, PNG, WebP, or GIF file on this device, up to
    /// 10 MB. Leave it out to remove the photo.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub path: Option<String>,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct ProfileIdArgs {
    /// The id of the profile, from lanjut_list_profiles.
    pub id: String,
}

#[derive(Debug, Serialize, Deserialize, schemars::JsonSchema)]
pub struct SaveProfileArgs {
    /// The profile to change. Leave it out to create a profile.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub id: Option<String>,
    /// The revision that lanjut_list_profiles gave. Needed with `id`.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub base_revision: Option<u64>,
    /// What the person calls the profile. Needed to create one.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub name: Option<String>,
    /// The header and the summary as Markdown, in the form that
    /// lanjut_list_profiles gives. Leave it out to keep them.
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub markdown: Option<String>,
}

fn check_title(name: &str, title: &str) -> Result<(), String> {
    if title.trim().is_empty() {
        return Err(format!("`{name}` is empty."));
    }
    if title.chars().count() > MAX_TITLE {
        return Err(format!("`{name}` is longer than {MAX_TITLE} characters."));
    }
    Ok(())
}

fn check_ids(name: &str, ids: &[String]) -> Result<(), String> {
    if ids.len() > MAX_LIST {
        return Err(format!("`{name}` holds more than {MAX_LIST} ids."));
    }
    ids.iter().try_for_each(|id| check_id(id))
}

impl Check for CreateResumeArgs {
    fn check(&self) -> Result<(), String> {
        check_title("title", &self.title)
    }
}

impl Check for DuplicateResumeArgs {
    fn check(&self) -> Result<(), String> {
        check_id(&self.id)?;
        self.title
            .as_deref()
            .map_or(Ok(()), |title| check_title("title", title))
    }
}

impl Check for ExportResumeArgs {
    fn check(&self) -> Result<(), String> {
        check_id(&self.id)?;
        self.file_name
            .as_deref()
            .map_or(Ok(()), |name| check_title("file_name", name))
    }
}

impl Check for ResumeSettingsArgs {
    fn check(&self) -> Result<(), String> {
        check_id(&self.id)?;
        if let Some(title) = &self.title {
            check_title("title", title)?;
        }
        if let Some(profile_id) = &self.profile_id {
            check_id(profile_id)?;
        }
        Ok(())
    }
}

impl Check for SectionOrderArgs {
    fn check(&self) -> Result<(), String> {
        check_id(&self.id)?;
        if self.preset.is_some() && self.order.is_some() {
            return Err("Give `preset` or `order`, not both.".into());
        }
        check_ids("order", self.order.as_deref().unwrap_or_default())?;
        check_ids("hidden", &self.hidden)?;
        check_ids("shown", &self.shown)
    }
}

impl Check for SetPhotoArgs {
    fn check(&self) -> Result<(), String> {
        check_id(&self.id)
    }
}

impl Check for ProfileIdArgs {
    fn check(&self) -> Result<(), String> {
        check_id(&self.id)
    }
}

impl Check for SaveProfileArgs {
    fn check(&self) -> Result<(), String> {
        if let Some(id) = &self.id {
            check_id(id)?;
            if self.base_revision.is_none() {
                return Err("Give the `base_revision` that lanjut_list_profiles gave.".into());
            }
        } else if self.name.is_none() {
            return Err("Give a `name` to create a profile.".into());
        }
        if let Some(name) = &self.name {
            check_title("name", name)?;
        }
        self.markdown
            .as_deref()
            .map_or(Ok(()), |text| check_text("markdown", text))
    }
}

fn check_id(id: &str) -> Result<(), String> {
    if id.trim().is_empty() {
        return Err("`id` is empty. Take an id from lanjut_list_resumes.".into());
    }
    if id.chars().count() > MAX_ID {
        return Err(format!(
            "`id` is longer than {MAX_ID} characters. Take an id from lanjut_list_resumes."
        ));
    }
    Ok(())
}

fn check_text(name: &str, text: &str) -> Result<(), String> {
    if text.chars().count() > MAX_TEXT {
        return Err(format!("`{name}` is longer than {MAX_TEXT} characters."));
    }
    Ok(())
}

pub trait Check {
    fn check(&self) -> Result<(), String>;
}

impl Check for ResumeIdArgs {
    fn check(&self) -> Result<(), String> {
        check_id(&self.id)
    }
}

impl Check for GetResumeArgs {
    fn check(&self) -> Result<(), String> {
        check_id(&self.id)
    }
}

impl Check for EditResumeArgs {
    fn check(&self) -> Result<(), String> {
        check_id(&self.id)?;
        if self.edits.is_empty() {
            return Err("`edits` is empty. Give at least one edit.".into());
        }
        if self.edits.len() > MAX_EDITS {
            return Err(format!(
                "`edits` holds more than {MAX_EDITS} edits. Use lanjut_replace_resume for a large change."
            ));
        }
        for (index, edit) in self.edits.iter().enumerate() {
            if edit.old_str.is_empty() {
                return Err(format!("`edits[{index}].old_str` is empty. Copy the text to replace from the Markdown."));
            }
            check_text(&format!("edits[{index}].old_str"), &edit.old_str)?;
            check_text(&format!("edits[{index}].new_str"), &edit.new_str)?;
        }
        Ok(())
    }
}

impl Check for ReplaceResumeArgs {
    fn check(&self) -> Result<(), String> {
        check_id(&self.id)?;
        if self.markdown.trim().is_empty() {
            return Err("`markdown` is empty. Give the full résumé.".into());
        }
        check_text("markdown", &self.markdown)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn edit(old_str: &str) -> TextEdit {
        TextEdit {
            old_str: old_str.into(),
            new_str: String::new(),
        }
    }

    #[test]
    fn refuses_an_empty_id() {
        let args = ResumeIdArgs { id: "  ".into() };
        assert!(args.check().is_err());
    }

    #[test]
    fn refuses_no_edits_and_an_empty_old_str() {
        let none = EditResumeArgs {
            id: "a".into(),
            base_revision: 1,
            edits: vec![],
        };
        assert!(none.check().is_err());
        let empty = EditResumeArgs {
            id: "a".into(),
            base_revision: 1,
            edits: vec![edit("x"), edit("")],
        };
        assert_eq!(
            empty.check().unwrap_err(),
            "`edits[1].old_str` is empty. Copy the text to replace from the Markdown."
        );
    }

    #[test]
    fn refuses_a_blank_or_long_markdown() {
        let blank = ReplaceResumeArgs {
            id: "a".into(),
            base_revision: 1,
            markdown: "\n".into(),
        };
        assert!(blank.check().is_err());
        let long = ReplaceResumeArgs {
            id: "a".into(),
            base_revision: 1,
            markdown: "x".repeat(MAX_TEXT + 1),
        };
        assert!(long.check().is_err());
    }

    #[test]
    fn format_defaults_to_markdown() {
        let args: GetResumeArgs = serde_json::from_str(r#"{"id":"a"}"#).unwrap();
        assert!(matches!(args.format, TextFormat::Markdown));
        let bad = serde_json::from_str::<GetResumeArgs>(r#"{"id":"a","format":"toml"}"#);
        assert!(bad.is_err());
    }
}

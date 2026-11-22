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

//! The MCP tools. They know nothing about résumés: each one asks the page.

use super::bridge::Bridge;
use rmcp::handler::server::router::tool::ToolRouter;
use rmcp::model::{CallToolResult, ContentBlock, Implementation, ServerCapabilities, ServerConfig};
use rmcp::{tool, tool_handler, tool_router, ServerHandler};
use std::sync::Arc;

const INSTRUCTIONS: &str = "Lanjut is a résumé builder on this device. \
Call lanjut_list_resumes to see the résumés of the active profile.";

#[derive(Clone)]
pub struct LanjutMcp {
    bridge: Arc<Bridge>,
    version: String,
    tool_router: ToolRouter<Self>,
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

    #[tool(
        description = "Gives the title, id, and last change of each résumé in the active Lanjut profile, newest first.",
        annotations(title = "List résumés", read_only_hint = true)
    )]
    async fn lanjut_list_resumes(&self) -> CallToolResult {
        match self.bridge.call("lanjut_list_resumes").await {
            Ok(value) => CallToolResult::success(vec![ContentBlock::text(value.to_string())]),
            Err(error) => CallToolResult::error(vec![ContentBlock::text(error.to_string())]),
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

import type { TemplateId } from "@/lib/templates";
import { buildResumeBlocks, isAtomicBlock } from "../resume-blocks";
import { resumeTypographyStyle } from "../resume-fonts";
import type { ResumePreview } from "../resume-preview";
import { TEMPLATE_BLOCK_VIEWS } from "../templates/template-block-view";

interface TakumiResumeFlowProps {
  preview: ResumePreview;
  template: TemplateId;
}

/**
 * The résumé as one continuous flow of the same blocks the preview draws.
 * The PDF renderer paginates it; atomic entries carry `data-atomic` so the
 * page break never lands inside them.
 */
export function TakumiResumeFlow(props: TakumiResumeFlowProps) {
  const { preview, template } = props;
  const blocks = buildResumeBlocks(preview);
  const BlockView = TEMPLATE_BLOCK_VIEWS[template];

  return (
    <div
      data-resume-flow
      data-template={template}
      className="font-sans text-foreground"
      style={resumeTypographyStyle(preview, template)}
    >
      {blocks.map((block, index) => (
        <div
          key={block.id}
          data-atomic={isAtomicBlock(block)}
          style={{ marginTop: index === 0 ? 0 : block.gapBefore }}
        >
          <BlockView block={block} />
        </div>
      ))}
    </div>
  );
}

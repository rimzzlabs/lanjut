import { A, O } from "@mobily/ts-belt";
import type { TemplateId } from "@/lib/templates";
import {
  buildResumeBlocks,
  isAtomicBlock,
  type ResumeBlock,
} from "../resume-blocks";
import { resumeTypographyStyle } from "../resume-fonts";
import { groupBlocks } from "../resume-paginate";
import type { ResumePreview } from "../resume-preview";
import { TextListMarkersContext } from "../resume-rich-text";
import {
  type BlockViewComponent,
  TEMPLATE_BLOCK_VIEWS,
} from "../templates/template-block-view";

interface TakumiResumeFlowProps {
  preview: ResumePreview;
  template: TemplateId;
}

/**
 * The résumé as one continuous flow of the same blocks the preview draws.
 * The PDF renderer paginates it. Atomic entries carry `data-atomic`, and blocks
 * the preview keeps together (a heading and its first entry) share a
 * `data-keep` group, so the page break never lands inside either.
 */
export function TakumiResumeFlow(props: TakumiResumeFlowProps) {
  const { preview, template } = props;
  const groups = groupBlocks(buildResumeBlocks(preview));
  const BlockView = TEMPLATE_BLOCK_VIEWS[template];

  return (
    <div
      data-resume-flow
      data-template={template}
      className="font-sans text-foreground"
      style={resumeTypographyStyle(preview, template)}
    >
      <TextListMarkersContext value={true}>
        {groups.map((group, index) => (
          <TakumiBlockGroup
            key={O.mapWithDefault(
              A.head(group),
              `${index}`,
              (block) => block.id,
            )}
            group={group}
            isFirst={index === 0}
            BlockView={BlockView}
          />
        ))}
      </TextListMarkersContext>
    </div>
  );
}

interface TakumiBlockGroupProps {
  group: ReadonlyArray<ResumeBlock>;
  isFirst: boolean;
  BlockView: BlockViewComponent;
}

// takumi-pdf 0.15 ignores `break-after: avoid`, so a heading is kept with its
// first entry by wrapping both in one `break-inside: avoid` group.
function TakumiBlockGroup(props: TakumiBlockGroupProps) {
  const { group, isFirst, BlockView } = props;
  const gapBefore = O.mapWithDefault(
    A.head(group),
    0,
    (block) => block.gapBefore,
  );

  return (
    <div
      data-keep={A.length(group) > 1}
      style={{ marginTop: isFirst ? 0 : gapBefore }}
    >
      {group.map((block, index) => (
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

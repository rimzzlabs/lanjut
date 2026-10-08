import { SORTED_TEMPLATES, type TemplateId } from "@lanjut/resume/templates";
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "@lanjut/ui/components/carousel";
import { cn } from "@lanjut/ui/lib/utils";
import { A, O, pipe } from "@mobily/ts-belt";
import { useEffect, useState } from "react";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import { PlatformResumeCreateTemplateZoom } from "./platform-resume-create-template-zoom";

interface PlatformResumeCreateTemplateCarouselProps {
  value: TemplateId;
  onValueChange: (template: TemplateId) => void;
  preview: ResumePreview;
  label: string;
}

function indexOfTemplate(id: TemplateId): number {
  return pipe(
    SORTED_TEMPLATES,
    A.getIndexBy((template) => template.id === id),
    O.getWithDefault(0),
  );
}

/**
 * Below the `lg` breakpoint: one page-wide preview per template, swiped left
 * and right. The slide in view is the chosen template. The next slide peeks
 * in at the edge, so the swipe is visible, and the dots jump to a template.
 * A tap on a slide chooses it and opens every page of it in a drawer.
 */
export function PlatformResumeCreateTemplateCarousel(
  props: PlatformResumeCreateTemplateCarouselProps,
) {
  const t = useTranslations("platform.templates");
  const [api, setApi] = useState<CarouselApi>();
  const [startIndex] = useState(() => indexOfTemplate(props.value));
  const [zoomed, setZoomed] = useState<TemplateId>(props.value);
  const [zoomOpen, setZoomOpen] = useState(false);
  const { onValueChange } = props;

  useEffect(() => {
    if (!api) return;
    const onSelect = () => {
      pipe(
        SORTED_TEMPLATES,
        A.get(api.selectedScrollSnap()),
        O.tap((template) => onValueChange(template.id)),
      );
    };
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api, onValueChange]);

  const current = pipe(
    SORTED_TEMPLATES,
    A.find((template) => template.id === props.value),
  );

  return (
    <div className="flex flex-col gap-3">
      <Carousel
        setApi={setApi}
        opts={{ startIndex, align: "center" }}
        aria-label={props.label}
      >
        <CarouselContent>
          {SORTED_TEMPLATES.map((template, index) => (
            <CarouselItem key={template.id} className="basis-5/6">
              <button
                type="button"
                aria-label={t("previewLabel", { name: template.name })}
                onClick={() => {
                  api?.scrollTo(index);
                  setZoomed(template.id);
                  setZoomOpen(true);
                }}
                className="block w-full cursor-zoom-in overflow-hidden rounded-sm bg-white shadow-sm ring-1 ring-black/5 outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
              >
                <ResumeThumbnail
                  resume={props.preview}
                  template={template.id}
                />
              </button>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {O.isSome(current) && (
        <div className="flex flex-col gap-0.5 text-center">
          <p className="text-sm font-medium text-primary">{current.name}</p>
          <p className="line-clamp-2 text-xs text-muted-foreground">
            {t(`descriptions.${current.id}`)}
          </p>
        </div>
      )}

      <TemplateDots
        value={props.value}
        onSelect={(index) => api?.scrollTo(index)}
      />

      <PlatformResumeCreateTemplateZoom
        open={zoomOpen}
        onOpenChange={setZoomOpen}
        template={zoomed}
        preview={props.preview}
      />
    </div>
  );
}

function TemplateDots(props: {
  value: TemplateId;
  onSelect: (index: number) => void;
}) {
  const t = useTranslations("forms.create");

  return (
    <div className="flex justify-center gap-1">
      {SORTED_TEMPLATES.map((template, index) => {
        const active = template.id === props.value;
        return (
          <button
            key={template.id}
            type="button"
            aria-label={t("showTemplate", { name: template.name })}
            aria-current={active ? "true" : undefined}
            onClick={() => props.onSelect(index)}
            className="grid size-6 cursor-pointer place-items-center rounded-full outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
          >
            <span
              className={cn(
                "block h-1.5 rounded-full transition-all",
                active ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/40",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

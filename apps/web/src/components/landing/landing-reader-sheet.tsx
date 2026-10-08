import type { TemplateId } from "@lanjut/resume/templates";
import { cn } from "@lanjut/ui/lib/utils";
import { ArrowsHorizontalIcon, CircleNotchIcon } from "@phosphor-icons/react";
import { animate } from "motion/react";
import {
  type KeyboardEvent,
  type PointerEvent,
  type RefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { useTranslations } from "use-intl";
import type { ResumePreview } from "@/components/editor/resume-preview";
import { ResumeThumbnail } from "@/components/editor/resume-thumbnail";
import { useReducedMotionPreference } from "@/hooks/use-reduced-motion-preference";

export type ReaderStatus = "reading" | "done" | "fallback";

interface LandingReaderSheetProps {
  sheetRef: RefObject<HTMLDivElement | null>;
  preview: ResumePreview;
  template: TemplateId;
  lines: ReadonlyArray<string>;
  status: ReaderStatus;
  chars: number | null;
}

const START = 40;
const KEY_STEP: Record<string, number> = {
  ArrowLeft: -4,
  ArrowDown: -4,
  ArrowRight: 4,
  ArrowUp: 4,
  PageDown: -12,
  PageUp: 12,
};

function clamp(value: number) {
  return Math.min(100, Math.max(0, value));
}

/**
 * One sheet, read two ways: the styled page left of the scanner, the text a
 * parser pulled out of the same page's PDF right of it.
 */
export function LandingReaderSheet(props: LandingReaderSheetProps) {
  const t = useTranslations("landing");
  const reduce = useReducedMotionPreference();
  const [position, setPosition] = useState(START);
  const draggingRef = useRef(false);
  const introRef = useRef<{ stop: () => void } | null>(null);

  useEffect(() => {
    if (reduce) return;
    const timer = window.setTimeout(() => {
      const out = animate(START, 34, {
        duration: 0.9,
        ease: [0.16, 1, 0.3, 1],
        onUpdate: setPosition,
      });
      introRef.current = out;
      void out.then(() => {
        if (introRef.current !== out) return;
        introRef.current = animate(34, START, {
          duration: 1,
          ease: [0.16, 1, 0.3, 1],
          onUpdate: setPosition,
        });
      });
    }, 700);
    return () => {
      window.clearTimeout(timer);
      introRef.current?.stop();
    };
  }, [reduce]);

  function stopIntro() {
    introRef.current?.stop();
    introRef.current = null;
  }

  function positionAt(clientX: number) {
    const rect = props.sheetRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return position;
    return clamp(((clientX - rect.left) / rect.width) * 100);
  }

  function onPointerDown(event: PointerEvent<HTMLDivElement>) {
    const onHandle = (event.target as Element).closest("[data-scanner-handle]");
    if (!onHandle && event.pointerType !== "mouse") return;
    stopIntro();
    draggingRef.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    setPosition(positionAt(event.clientX));
  }

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (!draggingRef.current) return;
    setPosition(positionAt(event.clientX));
  }

  function endDrag() {
    draggingRef.current = false;
  }

  function onKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      stopIntro();
      setPosition(event.key === "Home" ? 0 : 100);
      return;
    }
    const step = KEY_STEP[event.key];
    if (step === undefined) return;
    event.preventDefault();
    stopIntro();
    setPosition((value) => clamp(value + step));
  }

  const percent = Math.round(position);

  return (
    <div
      ref={props.sheetRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
      onLostPointerCapture={endDrag}
      className="relative aspect-3/4 cursor-col-resize overflow-hidden rounded-xl bg-white shadow-[0_48px_96px_-40px_rgb(0_0_0/0.55)] ring-1 ring-black/10 select-none @container mask-[linear-gradient(to_bottom,black_82%,transparent)] sm:aspect-16/10"
    >
      <div className="absolute inset-y-0 left-0 w-full min-w-220 sm:min-w-0">
        <ResumeThumbnail resume={props.preview} template={props.template} />
      </div>

      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute top-[3cqw] left-[3cqw] rounded-sm bg-neutral-900/6 px-2.5 py-1 text-[11px] font-medium text-neutral-700 transition-opacity duration-200 max-sm:hidden",
          position < 24 && "opacity-0",
        )}
      >
        {t("humanLabel")}
      </span>

      <div
        className="absolute inset-y-0 right-0 flex flex-col overflow-hidden bg-(--ink) font-machine"
        style={{ left: `${position}%` }}
      >
        <div
          className={cn(
            "flex flex-wrap items-center justify-between gap-x-3 gap-y-1 px-[3cqw] pt-[3cqw] text-[11px] transition-opacity duration-200 max-sm:hidden",
            position > 70 && "opacity-0",
          )}
        >
          <span className="shrink-0 rounded-sm bg-white/10 px-2.5 py-1 text-(--machine)">
            {t("machineLabel")}
          </span>
          <ReaderStatusLine status={props.status} chars={props.chars} />
        </div>
        <div
          aria-hidden
          className="min-w-0 px-[3cqw] pt-[2.5cqw] text-[max(11px,1.2cqw)] leading-[1.8]"
        >
          {props.lines.map((line, index) => (
            <p
              // biome-ignore lint/suspicious/noArrayIndexKey: extracted lines repeat; their position is their identity
              key={index}
              className={cn(
                "truncate",
                isHeadingLine(line)
                  ? "mt-[1.2em] font-semibold text-(--machine)"
                  : "text-(--machine-muted)",
              )}
            >
              {line}
            </p>
          ))}
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-(--scanner) shadow-[0_0_28px_2px_var(--scanner)]"
        style={{ left: `${position}%` }}
      >
        <button
          type="button"
          data-scanner-handle
          role="slider"
          aria-label={t("scannerLabel")}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={percent}
          aria-valuetext={t("scannerValue", { percent })}
          onKeyDown={onKeyDown}
          className="pointer-events-auto absolute top-1/2 left-1/2 grid size-11 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none place-items-center rounded-full bg-(--scanner) text-(--ink) shadow-lg outline-none focus-visible:ring-4 focus-visible:ring-(--scanner)/40 active:cursor-grabbing"
        >
          <ArrowsHorizontalIcon weight="bold" className="size-5" />
        </button>
      </div>
    </div>
  );
}

function isHeadingLine(line: string) {
  return line.length > 2 && line === line.toUpperCase() && /[A-Z]/.test(line);
}

function ReaderStatusLine(props: {
  status: ReaderStatus;
  chars: number | null;
}) {
  return (
    <span className="flex items-center gap-1.5 text-(--machine-muted)">
      {props.status === "reading" && (
        <CircleNotchIcon aria-hidden className="size-3 animate-spin" />
      )}
      <ReaderStatusText status={props.status} chars={props.chars} />
    </span>
  );
}

function ReaderStatusText(props: {
  status: ReaderStatus;
  chars: number | null;
}) {
  const t = useTranslations("landing");
  if (props.status === "reading") return <span>{t("reading")}</span>;
  if (props.status === "fallback") return <span>{t("readFallback")}</span>;
  return <span>{t("readDone", { chars: props.chars ?? 0 })}</span>;
}

"use client";

import { useEffect, useState } from "react";

const SIZE = 24;
const STROKE = 2;
const RADIUS = (SIZE - STROKE) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function ResumeDeleteCountdown(props: { seconds: number }) {
  const [remaining, setRemaining] = useState(props.seconds);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const started = Date.now();
    // next frame so the ring transitions from full to empty
    const frame = requestAnimationFrame(() => setOffset(CIRCUMFERENCE));
    const tick = setInterval(() => {
      const elapsed = Math.floor((Date.now() - started) / 1000);
      const left = Math.max(0, props.seconds - elapsed);
      setRemaining(left);
      if (left <= 0) clearInterval(tick);
    }, 200);
    return () => {
      cancelAnimationFrame(frame);
      clearInterval(tick);
    };
  }, [props.seconds]);

  return (
    <span
      className="relative inline-flex shrink-0 items-center justify-center"
      style={{ width: SIZE, height: SIZE }}
    >
      <svg aria-hidden="true" width={SIZE} height={SIZE} className="-rotate-90">
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          className="stroke-border"
        />
        <circle
          cx={SIZE / 2}
          cy={SIZE / 2}
          r={RADIUS}
          fill="none"
          strokeWidth={STROKE}
          strokeLinecap="round"
          className="stroke-primary"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{ transition: `stroke-dashoffset ${props.seconds}s linear` }}
        />
      </svg>
      <span className="absolute text-[0.625rem] font-medium tabular-nums">
        {remaining}
      </span>
    </span>
  );
}

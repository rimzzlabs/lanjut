import { A } from "@mobily/ts-belt";
import { motion } from "motion/react";

export interface ConfettiPiece {
  id: number;
  left: number;
  delay: number;
  duration: number;
  spin: number;
  drift: number;
  color: string;
  wide: boolean;
}

const COLORS = [
  "var(--primary)",
  "var(--chart-1)",
  "var(--chart-2)",
  "var(--chart-3)",
  "var(--chart-5)",
] as const;

/** A fresh burst. Call it from an event, never during render. */
export function makeConfetti(count: number): ReadonlyArray<ConfettiPiece> {
  return A.makeWithIndex(count, (id) => ({
    id,
    left: Math.random() * 100,
    delay: Math.random() * 0.35,
    duration: 1.6 + Math.random() * 1.2,
    spin: (Math.random() - 0.5) * 720,
    drift: (Math.random() - 0.5) * 80,
    color: COLORS[id % COLORS.length],
    wide: id % 3 === 0,
  }));
}

/** Pieces that fall once through the dialog, behind its content. */
export function DownloadConfetti(props: {
  pieces: ReadonlyArray<ConfettiPiece>;
}) {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-1 overflow-hidden"
    >
      {props.pieces.map((piece) => (
        <motion.span
          key={piece.id}
          className="absolute top-0 block rounded-[1px]"
          style={{
            left: `${piece.left}%`,
            width: piece.wide ? 10 : 6,
            height: piece.wide ? 6 : 10,
            backgroundColor: piece.color,
          }}
          initial={{ y: -24, x: 0, rotate: 0, opacity: 1 }}
          animate={{
            y: 420,
            x: piece.drift,
            rotate: piece.spin,
            opacity: 0,
          }}
          transition={{
            duration: piece.duration,
            delay: piece.delay,
            ease: [0.22, 1, 0.36, 1],
          }}
        />
      ))}
    </div>
  );
}

"use client";

import { usePoseImage } from "@/lib/images";
import type { Pose } from "@/lib/types";
import { PoseFigure } from "./PoseFigure";

function initials(name: string) {
  return name
    .split(/[\s-]+/)
    .filter((w) => w.length > 2 || /^[A-ZÉ]/.test(w))
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
}

/**
 * Photo uploaded by the teacher first, then the illustration from public/poses, then the mannequin figure, then initials.
 * Without `size`, fills its container as a square.
 */
export function PoseThumb({ pose, size, className = "" }: { pose: Pose; size?: number; className?: string }) {
  const photo = usePoseImage(pose.id);
  const style = size ? { width: size, height: size } : undefined;
  const box = `${size ? "" : "aspect-square w-full"} shrink-0 overflow-hidden rounded-lg ${className}`;
  if (photo) {
    // eslint-disable-next-line @next/next/no-img-element -- local blob URL
    return <img src={photo} alt={pose.nameFr} style={style} className={`${box} object-cover`} />;
  }
  if (pose.image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- static illustration, many small thumbnails
      <img src={pose.image} alt={pose.nameFr} style={style} loading="lazy" className={`${box} bg-thumb object-contain`} />
    );
  }
  if (pose.figure) {
    return (
      <div style={style} className={`${box} bg-fig-bg p-[8%]`}>
        <PoseFigure def={pose.figure} title={pose.nameFr} className="h-full w-full" />
      </div>
    );
  }
  return (
    <div
      style={{ ...style, fontSize: size ? size * 0.32 : undefined }}
      className={`${box} flex items-center justify-center bg-accent-soft font-semibold text-accent ${size ? "" : "text-3xl"}`}
      aria-hidden
    >
      {initials(pose.nameFr)}
    </div>
  );
}

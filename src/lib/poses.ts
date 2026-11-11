import { FAMILIES } from "./catalog/families";
import { DETAILS } from "./catalog/details";
import { FIGURES } from "./catalog/figures";
import { POSE_IMAGES } from "./catalog/pose-images";
import type { Pose } from "./types";

/**
 * Built-in catalog: one file per family under ./catalog.
 * Each pose gets its family, its detailed sheet, its illustration from public/poses and its mannequin figure (when available).
 */
export const BUILTIN_POSES: Pose[] = Object.entries(FAMILIES).flatMap(([family, poses]) =>
  poses.map((pose) => ({
    ...pose,
    family,
    ...(DETAILS[pose.id] && { details: DETAILS[pose.id] }),
    ...(POSE_IMAGES[pose.id] && { image: POSE_IMAGES[pose.id] }),
    ...(FIGURES[pose.id] && { figure: FIGURES[pose.id] }),
  })),
);

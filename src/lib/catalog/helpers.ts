import type { Category, Level, Pose } from "../types";

/**
 * Compact constructor for catalog entries.
 * Texts are written for Flow Creator; Sanskrit names are traditional (public domain).
 * Contraindications are indicative, to be reviewed by the teacher — not medical advice.
 */
export function p(
  id: string,
  nameFr: string,
  sanskrit: string,
  nameEn: string,
  categories: Category[],
  level: Level,
  sided: boolean,
  description: string,
  benefits: string[],
  contraindications: string[] = [],
): Pose {
  return { id, nameFr, sanskrit, nameEn, categories, level, sided, description, benefits, contraindications };
}

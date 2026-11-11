import type { FigureDef } from "../figure";
import { FIG_A_GENOUX } from "./figures-genoux";
import { FIG_ALLONGEES } from "./figures-allongees";
import { FIG_ASSISES } from "./figures-assises";
import { FIG_DEBOUT } from "./figures-debout";
import { FIG_INVERSIONS } from "./figures-inversions";
import { FIG_YIN } from "./figures-yin";

/** Mannequin angles per pose id. Conventions: see ../figure.ts. */
export const FIGURES: Record<string, FigureDef> = {
  ...FIG_DEBOUT,
  ...FIG_A_GENOUX,
  ...FIG_ASSISES,
  ...FIG_ALLONGEES,
  ...FIG_INVERSIONS,
  ...FIG_YIN,
};

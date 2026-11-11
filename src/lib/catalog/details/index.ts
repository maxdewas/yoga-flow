import type { PoseDetails } from "../../details";
import { DETAILS_ALLONGEES } from "./allongees";
import { DETAILS_ASSISES } from "./assises";
import { DETAILS_DEBOUT } from "./debout";
import { DETAILS_GENOUX } from "./genoux";
import { DETAILS_INVERSIONS } from "./inversions";
import { DETAILS_YIN } from "./yin";

/** Fiches détaillées du catalogue, par id de posture. */
export const DETAILS: Record<string, PoseDetails> = {
  ...DETAILS_DEBOUT,
  ...DETAILS_GENOUX,
  ...DETAILS_ASSISES,
  ...DETAILS_ALLONGEES,
  ...DETAILS_INVERSIONS,
  ...DETAILS_YIN,
};

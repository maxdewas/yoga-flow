import { ALLONGEES } from "./allongees";
import { ASSISES } from "./assises";
import { DEBOUT } from "./debout";
import { A_GENOUX } from "./genoux";
import { INVERSIONS } from "./inversions";
import { YIN } from "./yin";

/** One file per family; each pose id lives in exactly one family. */
export const FAMILIES = {
  debout: DEBOUT,
  genoux: A_GENOUX,
  assises: ASSISES,
  allongees: ALLONGEES,
  inversions: INVERSIONS,
  yin: YIN,
};

import { TransformedVariant } from "@/data/types";
import { contrastColors } from "./contrast-colors";

export const getNationColor = (
  variant: TransformedVariant,
  nation: string
): string => {
  const nationColors = variant.nationColors;
  const nationColor = nationColors ? nationColors[nation] : null;
  if (nationColor) return nationColor;
  const nationNotInVariant = !variant.nations.includes(nation);
  if (nationNotInVariant) {
    if (nation === "Neutral") {
      return "#d0d0d0";
    }
    throw Error(
      `Cannot find nation color for ${nation} in variant ${variant.nations}`
    );
  }
  const index = variant.nations.indexOf(nation);
  return contrastColors[index];
};

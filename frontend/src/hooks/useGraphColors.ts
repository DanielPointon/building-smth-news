import { EVENT_COLORS } from "../constants/color";

export const useGraphColors = (index: number): string => {
  return EVENT_COLORS[index % EVENT_COLORS.length];
};

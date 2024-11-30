import { EVENT_COLORS } from "components/graph/ProbabilityGraph";

export const useGraphColors = (index: number): string => {
  return EVENT_COLORS[index % EVENT_COLORS.length];
};

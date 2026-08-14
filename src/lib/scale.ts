import { Dimensions } from 'react-native';

/**
 * Every screen in the lifeDNA Figma file is drawn on a 220pt-wide frame that
 * stands in for the full phone width. Converting a Figma measurement therefore
 * means scaling it by however much wider the real device is, so proportions
 * land exactly where the design puts them on any screen size.
 */
const FIGMA_FRAME_WIDTH = 220;
const FIGMA_TO_DP = Dimensions.get('window').width / FIGMA_FRAME_WIDTH;

export function scale(figmaValue: number): number {
  return figmaValue * FIGMA_TO_DP;
}

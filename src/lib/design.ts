/**
 * Raw design values lifted from the lifeDNA Figma file. Every surface in the
 * design carries the same soft ambient shadow, and selection states reuse one
 * of three gradients, so both live here rather than being retyped per file.
 */

/** `0px 0px 4px 0px rgba(169,169,169,0.25)` on every card, field and pill. */
export const SHADOW = '0px 0px 4px rgba(169, 169, 169, 0.25)';

/**
 * The `ActiveButton` style: ButtonNextUI and the selected SelectButton1/2/3/5.
 * The first stop starts at 18.9% rather than the edge.
 */
export const GRADIENT_SELECT: readonly [string, string] = ['#4356F7', '#843FF6'];
export const GRADIENT_SELECT_STOPS: readonly [number, number] = [0.18919, 1];

/** Selected SelectButton4 alone still uses the older, wider brand ramp. */
export const GRADIENT_BRAND: readonly [string, string] = ['#4655F6', '#9423FF'];

/** The filled part of a step progress bar. */
export const GRADIENT_PROGRESS: readonly [string, string] = ['#4056F6', '#853EF6'];

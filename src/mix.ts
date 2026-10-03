import { isSafeCssValue } from './safe';
import { pickVariantIndexes } from './pick';
import {
  DEFAULT_FONTS,
  DEFAULT_PALETTE,
  WORD_BASE,
  createVariants,
  type FontSlot,
  type MixPalette,
  type WordStyle,
} from './variants';

export interface MixOptions {
  /** Change it to get a different arrangement of the same text. Default 0. */
  seed?: number | undefined;
  /** Recolour the built-in variants. */
  palette?: Partial<MixPalette> | undefined;
  /** Map font slots to your own `font-family` values (for example from `next/font`). */
  fonts?: Partial<Record<FontSlot, string | undefined>> | undefined;
}

export type MixedPiece =
  | { type: 'word'; text: string; style: WordStyle }
  | { type: 'space'; text: string }
  | { type: 'break' };

export interface MixResult {
  pieces: MixedPiece[];
  /** The resolved ink colour, intended as the text colour of the whole block. */
  ink: string;
  warnings: string[];
}

const PREFIX = '[mixed-text]';

function resolveValues<K extends string>(
  defaults: Readonly<Record<K, string>>,
  overrides: Partial<Record<K, string | undefined>> | undefined,
  label: string,
  warnings: string[],
): Record<K, string> {
  const out: Record<K, string> = { ...defaults };
  if (!overrides) return out;
  for (const [key, value] of Object.entries(overrides) as [K, string | undefined][]) {
    if (value === undefined) continue;
    if (!(key in defaults)) warnings.push(`${PREFIX} Unknown ${label} "${key}" was ignored.`);
    else if (typeof value !== 'string' || !isSafeCssValue(value))
      warnings.push(
        `${PREFIX} The ${label} "${key}" is not a safe CSS value; the default was kept.`,
      );
    else out[key] = value;
  }
  return out;
}

/**
 * Splits `text` into words and gives each word its own style. Whitespace between words is kept
 * (newlines become breaks); leading and trailing whitespace is dropped.
 */
export function mixText(text: string, options?: MixOptions): MixResult {
  const warnings: string[] = [];
  const colors = resolveValues(DEFAULT_PALETTE, options?.palette, 'palette colour', warnings);
  const fonts = resolveValues(DEFAULT_FONTS, options?.fonts, 'font slot', warnings);
  let seed = options?.seed ?? 0;
  if (!Number.isFinite(seed)) {
    warnings.push(`${PREFIX} "seed" must be a finite number; 0 was used.`);
    seed = 0;
  }

  const pool = createVariants(colors, fonts);
  const tokens = [...text.matchAll(/\S+|\s+/g)].map((match) => match[0]);
  const isWord = (token: string): boolean => /\S/.test(token);
  const first = tokens.findIndex(isWord);
  if (first === -1) return { pieces: [], ink: colors.ink, warnings };
  const last = tokens.length - 1 - [...tokens].reverse().findIndex(isWord);
  const inner = tokens.slice(first, last + 1);

  const words = inner.filter(isWord);
  const picks = pickVariantIndexes(
    words,
    pool.map((variant) => variant['fontFamily']),
    seed,
  );

  const pieces: MixedPiece[] = [];
  let wordIndex = 0;
  for (const token of inner) {
    if (isWord(token)) {
      const variant = pool[picks[wordIndex++] ?? 0] ?? {};
      pieces.push({ type: 'word', text: token, style: { ...WORD_BASE, ...variant } });
      continue;
    }
    const breaks = token.match(/\r\n|\r|\n/g)?.length ?? 0;
    if (breaks > 0) for (let i = 0; i < breaks; i++) pieces.push({ type: 'break' });
    else pieces.push({ type: 'space', text: token });
  }
  return { pieces, ink: colors.ink, warnings };
}

import { createElement, Fragment } from 'react';
import type { CSSProperties, ReactElement, ReactNode } from 'react';
import { mixText, type MixedPiece, type MixOptions } from './mix';
import { resolveSize, type ResponsiveSize, type SizeValue } from './size';

export type MixedTextElement =
  | 'p'
  | 'span'
  | 'div'
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'blockquote'
  | 'figcaption'
  | 'label'
  | 'li';

export interface MixedTextProps extends MixOptions {
  /** Rendered as plain text; never interpreted as HTML. */
  text: string;
  /**
   * Base font size; every word's decoration scales from it. A CSS value (`"2rem"`,
   * `"clamp(1.5rem, 4vw, 3rem)"`), a number of px, or `{ small, medium, large }` for
   * different sizes per screen width. Omit to inherit.
   */
  size?: SizeValue | ResponsiveSize | undefined;
  /** Element to render. Defaults to `p`. */
  as?: MixedTextElement | undefined;
  className?: string | undefined;
  /** Merged last, so it can override anything the component sets (colour, margin, line height). */
  style?: CSSProperties | undefined;
  id?: string | undefined;
  lang?: string | undefined;
  dir?: 'ltr' | 'rtl' | 'auto' | undefined;
  'aria-label'?: string | undefined;
  'aria-labelledby'?: string | undefined;
  'aria-describedby'?: string | undefined;
}

// Module-scoped so the published package needs no Node typings.
declare const process: { env: { NODE_ENV?: string | undefined } };

function isDevelopment(): boolean {
  try {
    // Bundlers replace this expression; the try/catch covers unbundled environments.
    return process.env.NODE_ENV !== 'production';
  } catch {
    return false;
  }
}

function renderPiece(piece: MixedPiece, key: number): ReactNode {
  if (piece.type === 'break') return createElement('br', { key });
  if (piece.type === 'space') return piece.text;
  return createElement('span', { key, style: piece.style }, piece.text);
}

/**
 * Renders text with every word in a different font and decoration. Stateless and hook-free,
 * so it works in React Server Components. Same props always produce the same markup.
 */
export function MixedText(props: MixedTextProps): ReactElement {
  const {
    text,
    size,
    as: tag = 'p',
    seed,
    palette,
    fonts,
    className,
    style,
    ...attributes
  } = props;

  const mixed = mixText(text, { seed, palette, fonts });
  const sizing = resolveSize(size, mixed.warnings);

  if (mixed.warnings.length > 0 && isDevelopment()) {
    for (const warning of mixed.warnings) console.warn(warning);
  }

  const rootStyle: CSSProperties = {
    margin: 0,
    color: mixed.ink,
    lineHeight: 1.2,
    wordSpacing: '0.1em',
    ...(sizing.fontSize === undefined ? {} : { fontSize: sizing.fontSize }),
    ...style,
  };
  const classes = [sizing.className, className].filter(Boolean).join(' ');

  const element = createElement(
    tag,
    { ...attributes, ...(classes ? { className: classes } : {}), style: rootStyle },
    mixed.pieces.map(renderPiece),
  );

  if (sizing.css === undefined) return element;

  // dangerouslySetInnerHTML is required: React escapes quotes and `&` inside <style>, which
  // would corrupt the css. The string is built here from values that were validated to
  // contain no "<", so it cannot close the element or inject markup.
  return createElement(
    Fragment,
    null,
    createElement('style', { dangerouslySetInnerHTML: { __html: sizing.css } }),
    element,
  );
}

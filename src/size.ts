import { hashString } from './pick';
import { isSafeCssValue } from './safe';

export type SizeValue = string | number;

/** Different base sizes per screen width. Breakpoints: small < 768px <= medium < 1024px <= large. */
export interface ResponsiveSize {
  small?: SizeValue | undefined;
  medium?: SizeValue | undefined;
  large?: SizeValue | undefined;
}

export interface ResolvedSize {
  /** Inline `font-size`, for a single value. */
  fontSize: string | undefined;
  /** Scoped media-query stylesheet, for per-screen values. Contains no `<`. */
  css: string | undefined;
  /** Class that scopes `css`. */
  className: string | undefined;
}

const PREFIX = '[mixed-text]';
const QUERIES = {
  small: '(max-width:767.98px)',
  medium: '(min-width:768px) and (max-width:1023.98px)',
  large: '(min-width:1024px)',
} as const;

function format(
  value: SizeValue | undefined,
  label: string,
  warnings: string[],
): string | undefined {
  if (value === undefined || value === '') return undefined;
  if (typeof value === 'number') {
    if (Number.isFinite(value)) return value === 0 ? '0' : `${value}px`;
    warnings.push(`${PREFIX} ${label} must be a finite number.`);
    return undefined;
  }
  if (typeof value === 'string' && isSafeCssValue(value.trim())) return value.trim();
  warnings.push(`${PREFIX} ${label} is not a safe CSS value and was ignored.`);
  return undefined;
}

export function resolveSize(
  size: SizeValue | ResponsiveSize | undefined,
  warnings: string[],
): ResolvedSize {
  if (size === undefined || typeof size === 'string' || typeof size === 'number') {
    return { fontSize: format(size, 'size', warnings), css: undefined, className: undefined };
  }
  const rules: string[] = [];
  for (const name of ['small', 'medium', 'large'] as const) {
    const value = format(size[name], `size.${name}`, warnings);
    if (value !== undefined) rules.push(`@media ${QUERIES[name]}{{S}{font-size:${value}}}`);
  }
  if (rules.length === 0) return { fontSize: undefined, css: undefined, className: undefined };
  const template = rules.join('');
  const className = `mt-${hashString(template).toString(36)}`;
  return { fontSize: undefined, css: template.split('{S}').join(`.${className}`), className };
}

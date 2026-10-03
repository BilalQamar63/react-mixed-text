export interface MixPalette {
  /** Text colour of the whole block, dark fills and the outline variant. */
  ink: string;
  /** Highlighter background. */
  cream: string;
  /** Accent text colour. */
  accent: string;
  /** Subtle background. */
  soft: string;
  /** Light blue background. */
  blue: string;
}

/** The font slots used by the built-in variants. Map each to a CSS `font-family` value. */
export type FontSlot =
  | 'playfair'
  | 'caveat'
  | 'grotesk'
  | 'mono'
  | 'dmSerif'
  | 'fraunces'
  | 'bebas'
  | 'pacifico'
  | 'abril'
  | 'marker'
  | 'typewriter'
  | 'archivoBlack'
  | 'righteous'
  | 'lobster'
  | 'cinzel'
  | 'lora'
  | 'syne'
  | 'bungee';

export type WordStyle = Readonly<Record<string, string>>;

export const DEFAULT_PALETTE: Readonly<MixPalette> = {
  ink: '#0f172a',
  cream: '#fde68a',
  accent: '#b45309',
  soft: '#f1f5f9',
  blue: '#bfdbfe',
};

/**
 * Google Fonts family names with generic fallbacks. The package never loads fonts: load them
 * yourself (see the README) or map each slot to your own value with the `fonts` prop.
 */
export const DEFAULT_FONTS: Readonly<Record<FontSlot, string>> = {
  playfair: "'Playfair Display', Georgia, serif",
  caveat: "Caveat, 'Comic Sans MS', cursive",
  grotesk: "'Space Grotesk', system-ui, sans-serif",
  mono: "'JetBrains Mono', ui-monospace, Menlo, Consolas, monospace",
  dmSerif: "'DM Serif Display', Georgia, serif",
  fraunces: 'Fraunces, Georgia, serif',
  bebas: "'Bebas Neue', Impact, sans-serif",
  pacifico: "Pacifico, 'Brush Script MT', cursive",
  abril: "'Abril Fatface', Georgia, serif",
  marker: "'Permanent Marker', 'Comic Sans MS', cursive",
  typewriter: "'Special Elite', 'Courier New', monospace",
  archivoBlack: "'Archivo Black', 'Arial Black', sans-serif",
  righteous: 'Righteous, system-ui, sans-serif',
  lobster: "Lobster, 'Brush Script MT', cursive",
  cinzel: 'Cinzel, Georgia, serif',
  lora: 'Lora, Georgia, serif',
  syne: 'Syne, system-ui, sans-serif',
  bungee: 'Bungee, Impact, sans-serif',
};

/** Applied to every word before its variant. The margin is the gap between rows. */
export const WORD_BASE: WordStyle = {
  display: 'inline-block',
  lineHeight: '1.15',
  verticalAlign: 'middle',
  margin: '0.15em 0',
};

/** Eighteen word styles. Sizes and paddings are in `em`, so they scale with the text size. */
export function createVariants(
  colors: Readonly<MixPalette>,
  fonts: Readonly<Record<FontSlot, string>>,
): WordStyle[] {
  return [
    { fontFamily: fonts.playfair, fontWeight: '900', fontSize: '1.1em' },
    {
      fontFamily: fonts.caveat,
      fontWeight: '700',
      fontSize: '1.3em',
      border: '2px dashed',
      borderRadius: '0',
      padding: '0 0.3em',
    },
    {
      fontFamily: fonts.grotesk,
      fontWeight: '500',
      border: '2px solid',
      borderRadius: '999px',
      padding: '0 0.55em',
    },
    {
      fontFamily: fonts.mono,
      fontSize: '0.8em',
      backgroundColor: colors.ink,
      color: '#fff',
      borderRadius: '6px',
      padding: '0.15em 0.45em',
    },
    {
      fontFamily: fonts.fraunces,
      fontStyle: 'italic',
      border: '2px solid',
      borderRadius: '1em 0.2em 1em 0.2em',
      padding: '0 0.5em',
    },
    {
      fontFamily: fonts.dmSerif,
      fontSize: '1.15em',
      textDecoration: 'underline wavy',
      textUnderlineOffset: '0.2em',
    },
    {
      fontFamily: fonts.bebas,
      fontSize: '1.3em',
      textTransform: 'uppercase',
      letterSpacing: '0.08em',
      backgroundColor: colors.cream,
      padding: '0 0.35em',
    },
    {
      fontFamily: fonts.pacifico,
      fontSize: '0.95em',
      border: '2px dotted',
      borderRadius: '60% 40% 55% 45% / 50% 60% 40% 50%',
      padding: '0 0.6em',
    },
    {
      fontFamily: fonts.abril,
      backgroundColor: colors.cream,
      borderRadius: '8px',
      padding: '0 0.4em',
      transform: 'rotate(-2deg)',
    },
    {
      fontFamily: fonts.marker,
      fontSize: '0.95em',
      border: '3px double',
      borderRadius: '4px',
      padding: '0 0.35em',
      transform: 'rotate(1.5deg)',
    },
    {
      fontFamily: fonts.typewriter,
      fontSize: '0.9em',
      borderBottom: '2px solid',
      borderRadius: '0',
      padding: '0 0.15em',
    },
    {
      fontFamily: fonts.archivoBlack,
      fontSize: '0.75em',
      textTransform: 'uppercase',
      border: '2px solid',
      borderRadius: '0 1em 0 1em',
      padding: '0.1em 0.55em',
    },
    {
      fontFamily: fonts.righteous,
      backgroundColor: colors.ink,
      color: '#fff',
      borderRadius: '999px',
      padding: '0.05em 0.6em',
    },
    { fontFamily: fonts.lobster, fontSize: '1.2em', color: colors.accent },
    {
      fontFamily: fonts.cinzel,
      fontWeight: '800',
      fontSize: '0.8em',
      textTransform: 'uppercase',
      letterSpacing: '0.12em',
      border: '1px solid',
      borderRadius: '2px',
      padding: '0 0.5em',
    },
    {
      fontFamily: fonts.lora,
      fontStyle: 'italic',
      fontWeight: '500',
      backgroundColor: colors.soft,
      borderLeft: '4px solid',
      borderRadius: '0 8px 8px 0',
      padding: '0 0.45em',
    },
    {
      fontFamily: fonts.syne,
      fontSize: '1.15em',
      color: 'transparent',
      WebkitTextStroke: `1.2px ${colors.ink}`,
    },
    {
      fontFamily: fonts.bungee,
      fontSize: '0.7em',
      backgroundColor: colors.blue,
      border: '2px solid',
      borderRadius: '12px',
      padding: '0.1em 0.5em',
    },
  ];
}

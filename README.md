# mixed-text

React component that gives **every word its own font and decoration**: pill borders, highlighter
backgrounds, wavy underlines, outlines, slight rotations. You pass a string; it does the rest.

```tsx
import { MixedText } from 'react-mixed-text';

<MixedText text="A little about who I am:" size="2rem" />;
```

Each word picks one of 18 built-in styles. The pick is **deterministic**: the same text and
`seed` always give the same arrangement, on the server and in the browser. A word never gets the
same style or font as the word before it.

## Install

```bash
pnpm add react-mixed-text      # or: npm install / yarn add / bun add
```

Peer dependency: `react >= 18`. No other dependencies, no stylesheet to import, no `"use client"`.

## Fonts (do this once)

The package never bundles or downloads fonts. The 18 styles name these Google Fonts families
(with generic fallbacks, so text is readable even if you load nothing): Playfair Display, Caveat,
Space Grotesk, JetBrains Mono, DM Serif Display, Fraunces, Bebas Neue, Pacifico, Abril Fatface,
Permanent Marker, Special Elite, Archivo Black, Righteous, Lobster, Cinzel, Lora, Syne, Bungee.

**Any site (Vite, plain HTML, …):** add this to your `<head>` (also in `demo/index.html`):

```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link
  rel="stylesheet"
  href="https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Archivo+Black&family=Bebas+Neue&family=Bungee&family=Caveat:wght@500;700&family=Cinzel:wght@600;800&family=DM+Serif+Display&family=Fraunces:ital,wght@0,400;0,700;1,400;1,700&family=JetBrains+Mono:wght@400;500;700&family=Lobster&family=Lora:ital,wght@0,500;0,700;1,500;1,700&family=Pacifico&family=Permanent+Marker&family=Playfair+Display:wght@700;900&family=Righteous&family=Space+Grotesk:wght@400;500;700&family=Special+Elite&family=Syne:wght@800&display=swap"
/>
```

**Next.js with `next/font`:** it gives each font a generated family name, so pass those in with
`fonts`. You only need the slots you load; the rest use the defaults above.

```tsx
import { Playfair_Display, Caveat } from 'next/font/google';
import { MixedText } from 'react-mixed-text';

const playfair = Playfair_Display({ subsets: ['latin'], weight: ['700', '900'] });
const caveat = Caveat({ subsets: ['latin'], weight: ['500', '700'] });

export default function Page() {
  return (
    <MixedText
      text="A little about who I am:"
      fonts={{ playfair: playfair.style.fontFamily, caveat: caveat.style.fontFamily }}
    />
  );
}
```

Slots: `playfair`, `caveat`, `grotesk`, `mono`, `dmSerif`, `fraunces`, `bebas`, `pacifico`, `abril`,
`marker`, `typewriter`, `archivoBlack`, `righteous`, `lobster`, `cinzel`, `lora`, `syne`, `bungee`.

## Props

| Prop                                                                     | Type                                                                                     | Default            | Notes                                                                              |
| ------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------- | ------------------ | ---------------------------------------------------------------------------------- |
| `text`                                                                   | `string`                                                                                 | required           | Rendered as plain text, never as HTML.                                             |
| `size`                                                                   | `string \| number \| { small?, medium?, large? }`                                        | inherit            | Base font size. Every word's decoration scales from it (all in `em`).              |
| `seed`                                                                   | `number`                                                                                 | `0`                | Change it for a different arrangement of the same text.                            |
| `palette`                                                                | `{ ink?, cream?, accent?, soft?, blue? }`                                                | see below          | Recolours the styles. `ink` is also the text colour of the block.                  |
| `fonts`                                                                  | `{ [slot]: string }`                                                                     | Google Fonts names | Map font slots to your own `font-family` values.                                   |
| `as`                                                                     | `'p' \| 'span' \| 'div' \| 'h1'…'h6' \| 'blockquote' \| 'figcaption' \| 'label' \| 'li'` | `'p'`              | Use a real heading for headings.                                                   |
| `className`, `style`                                                     |                                                                                          |                    | `style` is merged last, so it can override anything (colour, margin, line height). |
| `id`, `lang`, `dir`, `aria-label`, `aria-labelledby`, `aria-describedby` |                                                                                          |                    | Forwarded as given.                                                                |

Default palette: `ink #0f172a`, `cream #fde68a`, `accent #b45309`, `soft #f1f5f9`, `blue #bfdbfe`.

### Sizes for small, medium and large screens

```tsx
<MixedText
  text="I build software around real problems."
  size={{ small: '1.25rem', medium: '1.75rem', large: '2.5rem' }}
/>
```

`small` is below 768px, `medium` is 768px to 1023px, `large` is 1024px and up. Omit any you don't
need. This uses CSS media queries (a small scoped `<style>` element), so nothing re-renders on
resize. For a single fluid value use a string: `size="clamp(1.5rem, 4vw, 3rem)"`. Media queries
follow the viewport, not the container.

### Another arrangement

```tsx
<MixedText text="Same words, new look" seed={3} />
```

## How it renders

```html
<p style="margin:0;color:#0f172a;line-height:1.2;word-spacing:.1em;font-size:2rem">
  <span style="display:inline-block;font-family:Fraunces,…;font-style:italic;border:2px solid;…"
    >A</span
  >
  <span style="display:inline-block;font-family:'Abril Fatface',…;background-color:#fde68a;…"
    >little</span
  >
  …
</p>
```

Words are `inline-block` spans separated by ordinary spaces (not a flex container), so the sentence
keeps its real spaces and wraps like normal text. Punctuation stays attached to its word, so
`problems.` is one pill. Newlines in `text` become `<br>`.

## Accessibility

- `as="h1"` renders a real `<h1>`; the default is a real `<p>`.
- The package adds no ARIA. The text content and accessible name equal your original string
  (spaces included); nothing is hidden or duplicated.
- The styles are purely visual. You are responsible for contrast, in particular if you change
  `palette`. Some styles (outlined text, rotated words) are decorative and read less easily; that
  is the point of the effect, so use it on short display text rather than long body copy.
- Tests cover heading roles, accessible names, text content and the absence of ARIA.

## Server rendering and Next.js

The component has no hooks, state, effects or browser access, so it works in React Server
Components and renders identical markup on server and client. Server rendering is covered by
tests with `react-dom/server`; there is no automated test against an actual Next.js build.

## Security

`text` is rendered as text; HTML is not supported. `size`, `palette` and `fonts` values are
validated: anything containing `<`, `{`, `}`, `;`, `!`, comment openers, control characters or
unbalanced quotes or parentheses is ignored with a development warning. The only
`dangerouslySetInnerHTML` is for the `<style>` element used by per-screen `size`, which can only
contain validated values (React would otherwise HTML-escape quotes).

## Also exported

`mixText(text, options?)` is the framework-agnostic core: it returns the words (with their style
objects), spaces and line breaks, without React, so it can be used to build an adapter for another
framework.

## Size and performance

Measured with `pnpm size` on this repository's build (esbuild-minified `dist/index.js`, before
tree-shaking):

| Raw      | Gzip    | Minified | Minified + gzip |
| -------- | ------- | -------- | --------------- |
| 11.10 kB | 3.97 kB | 6.30 kB  | 2.71 kB         |

`pnpm bench` times `mixText` on your machine. On the development sandbox it took about 6 µs for a
6-word sentence and about 65 µs for 100 words; results depend on hardware. There are no hooks,
effects or state, and no work happens beyond splitting the text and hashing each word.

## Development

```bash
pnpm install
pnpm dev          # demo at http://localhost:5173
pnpm test         # unit, React (jsdom) and SSR (node) tests
pnpm verify       # typecheck, lint, format, test, build, dist check, npm pack dry run
```

`dev` runs Vite directly, so `npm run dev` or `bun run dev` also work. The other scripts use pnpm.

## License

[MIT](LICENSE). See also [CONTRIBUTING](CONTRIBUTING.md), [Code of Conduct](CODE_OF_CONDUCT.md)
and [SECURITY](SECURITY.md).

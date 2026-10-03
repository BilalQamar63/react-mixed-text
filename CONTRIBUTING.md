# Contributing

This package does one thing: render text with every word in a different font and decoration.
Please keep it that way; open an issue before proposing new features.

## Setup

Requires Node 20+ and pnpm (`npm install -g pnpm`).

```bash
pnpm install
pnpm dev          # demo at http://localhost:5173 (`npm run dev` / `bun run dev` also work)
pnpm test
pnpm typecheck
pnpm lint         # pnpm lint:fix to autofix
pnpm format
pnpm build
pnpm verify       # everything CI runs, plus npm pack --dry-run
```

## Layout

```text
src/variants.ts    the 18 word styles, palette and default font stacks
src/pick.ts        FNV-1a hash and the deterministic no-repeat picker
src/mix.ts         mixText(): text → words/spaces/breaks with styles (no React)
src/size.ts        single and per-screen font sizes (scoped media queries)
src/safe.ts        rejects CSS values that could escape a declaration or <style>
src/MixedText.tsx  the React component
```

Rules of the road:

- The arrangement for a given `text` and `seed` must never change in a patch release. A test pins
  it against the original portfolio page. Changing the hash, pool order or picking logic is a
  breaking change.
- No runtime dependencies. The package never loads fonts.
- Never throw on user input; warn in development and ignore invalid values.
- User strings are data: no HTML parsing, no `eval`.

## Pull requests

Run `pnpm verify` first, add tests for behaviour changes, and add a changeset (`pnpm changeset`)
for anything that changes the published package.

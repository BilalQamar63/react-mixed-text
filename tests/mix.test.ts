import { describe, expect, it } from 'vitest';
import { mixText } from '../src';
import type { MixedPiece } from '../src';
import { pickVariantIndexes } from '../src/pick';
import { DEFAULT_FONTS, DEFAULT_PALETTE, createVariants } from '../src/variants';

const pool = createVariants(DEFAULT_PALETTE, DEFAULT_FONTS);
const fontOf = pool.map((variant) => variant['fontFamily']);
const picksFor = (text: string, seed: number): number[] =>
  pickVariantIndexes(text.split(/\s+/), fontOf, seed);

const words = (pieces: MixedPiece[]): string[] =>
  pieces.flatMap((piece) => (piece.type === 'word' ? [piece.text] : []));
const asText = (pieces: MixedPiece[]): string =>
  pieces.map((piece) => (piece.type === 'break' ? '\n' : piece.text)).join('');

const SENTENCE = 'I build software around real problems and enjoy it.';

describe('arrangement', () => {
  it('reproduces the original portfolio page arrangements', () => {
    expect(picksFor('A little about who I am:', 0)).toEqual([4, 8, 2, 4, 6, 2]);
    expect(picksFor('A little about who I am:', 6)).toEqual([2, 14, 6, 0, 6, 14]);
    expect(picksFor('I build software around real problems.', 0).slice(0, 6)).toEqual([
      12, 13, 10, 5, 9, 14,
    ]);
  });

  it('is deterministic, and the seed changes the result', () => {
    const a = JSON.stringify(mixText(SENTENCE, { seed: 1 }).pieces);
    expect(JSON.stringify(mixText(SENTENCE, { seed: 1 }).pieces)).toBe(a);
    expect(JSON.stringify(mixText(SENTENCE, { seed: 2 }).pieces)).not.toBe(a);
    expect(JSON.stringify(mixText(SENTENCE).pieces)).toBe(
      JSON.stringify(mixText(SENTENCE, { seed: 0 }).pieces),
    );
  });

  it('never repeats the previous word’s variant or font', () => {
    for (let seed = 0; seed < 60; seed++) {
      const picks = picksFor(SENTENCE.repeat(4), seed);
      picks.forEach((pick, i) => {
        if (i === 0) return;
        const previous = picks[i - 1] as number;
        expect(pick).not.toBe(previous);
        expect(fontOf[pick]).not.toBe(fontOf[previous]);
      });
    }
  });

  it('has 18 variants with a distinct font each', () => {
    expect(pool).toHaveLength(18);
    expect(new Set(fontOf).size).toBe(18);
  });
});

describe('mixText', () => {
  it('styles each space-separated word and keeps spaces as plain pieces', () => {
    const { pieces } = mixText(SENTENCE);
    expect(words(pieces)).toEqual(SENTENCE.split(' '));
    expect(pieces.filter((p) => p.type === 'space').every((p) => p.text === ' ')).toBe(true);
    expect(asText(pieces)).toBe(SENTENCE);
  });

  it('keeps punctuation with its word', () => {
    expect(words(mixText('real problems.').pieces)).toEqual(['real', 'problems.']);
    expect(words(mixText("That's it,").pieces)).toEqual(["That's", 'it,']);
  });

  it('gives every word an inline-block with the row gap', () => {
    for (const piece of mixText(SENTENCE).pieces) {
      if (piece.type !== 'word') continue;
      expect(piece.style).toMatchObject({
        display: 'inline-block',
        verticalAlign: 'middle',
        margin: '0.15em 0',
      });
    }
  });

  it('drops leading and trailing whitespace and turns newlines into breaks', () => {
    expect(mixText('   ').pieces).toEqual([]);
    expect(mixText('').pieces).toEqual([]);
    expect(asText(mixText('  a b  ').pieces)).toBe('a b');
    expect(mixText('a\nb').pieces.map((p) => p.type)).toEqual(['word', 'break', 'word']);
    expect(mixText('a\r\n\r\nb').pieces.filter((p) => p.type === 'break')).toHaveLength(2);
  });

  it('handles non-Latin text and emoji without losing characters', () => {
    for (const text of ['مرحبا بالعالم', '你好 世界', 'こんにちは 世界', '👨‍💻 ❤️ é e\u0301']) {
      expect(asText(mixText(text).pieces)).toBe(text);
    }
  });

  it('emits the outline variant as -webkit-text-stroke', () => {
    const syne = pool.find((variant) => variant['WebkitTextStroke'] !== undefined);
    expect(syne).toMatchObject({ color: 'transparent', WebkitTextStroke: '1.2px #0f172a' });
  });

  it('recolours with a palette and maps fonts', () => {
    const { pieces, ink } = mixText(SENTENCE, {
      palette: { cream: 'hotpink', ink: 'black' },
      fonts: { bebas: 'MyBebas' },
    });
    const css = JSON.stringify(pieces);
    expect(css).not.toContain('#fde68a');
    expect(css).not.toContain('Bebas Neue');
    expect(ink).toBe('black');
    expect(css).toContain('hotpink');
  });

  it('rejects unsafe palette, font and seed values with warnings', () => {
    const { pieces, warnings } = mixText('a b c d e f', {
      palette: { cream: 'red; } body { display:none' },
      fonts: { bebas: '"unclosed' },
      seed: Number.NaN,
    });
    const css = JSON.stringify(pieces);
    expect(css).not.toContain('display:none');
    expect(css).toContain('#fde68a');
    expect(warnings).toHaveLength(3);
  });

  it('warns about unknown font slots without throwing', () => {
    // @ts-expect-error deliberately invalid
    const { warnings } = mixText('a', { fonts: { nope: 'X' } });
    expect(warnings.join()).toContain('Unknown font slot');
  });
});

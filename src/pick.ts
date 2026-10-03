/** 32-bit FNV-1a: identical on server and client, so the arrangement never shifts on hydration. */
export function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/**
 * Picks one variant index per word. A word never gets the same variant or the same font as the
 * word before it. Fully determined by `seed`, the word position and the word itself.
 */
export function pickVariantIndexes(
  words: readonly string[],
  fontOf: readonly (string | undefined)[],
  seed: number,
): number[] {
  const picks: number[] = [];
  const size = fontOf.length;
  if (size === 0) return picks;
  words.forEach((word, i) => {
    let index = hashString(`${seed}-${i}-${word}`) % size;
    const previous = picks[i - 1];
    for (
      let tries = 0;
      previous !== undefined &&
      (index === previous || (fontOf[index] !== undefined && fontOf[index] === fontOf[previous])) &&
      tries < size;
      tries++
    ) {
      index = (index + 1) % size;
    }
    picks.push(index);
  });
  return picks;
}

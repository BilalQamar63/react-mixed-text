/**
 * True when `value` can be used as a CSS value (inline, or inside the generated stylesheet)
 * without ending the declaration or rule, opening a comment, or closing a `<style>` element.
 */
export function isSafeCssValue(value: string): boolean {
  if (value.includes('<')) return false;
  let depth = 0;
  let quote = '';
  for (let i = 0; i < value.length; i++) {
    const char = value.charAt(i);
    const code = value.charCodeAt(i);
    if (code < 0x20 || code === 0x7f) return false;
    if (char === '\\') {
      i++;
      continue;
    }
    if (quote) {
      if (char === quote) quote = '';
      continue;
    }
    if (char === '"' || char === "'") quote = char;
    else if (char === '(') depth++;
    else if (char === ')') {
      depth--;
      if (depth < 0) return false;
    } else if (char === '{' || char === '}' || char === ';' || char === '!') return false;
    else if (char === '/' && value.charAt(i + 1) === '*') return false;
  }
  return depth === 0 && quote === '';
}

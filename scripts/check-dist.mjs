// Build test: loads the *built* package through its package.json exports, as a consumer would.
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import { renderToString } from 'react-dom/server';

const require = createRequire(import.meta.url);
const esm = await import('react-mixed-text');
const cjs = require('react-mixed-text');

assert.deepEqual(Object.keys(esm).sort(), Object.keys(cjs).sort(), 'ESM/CJS export parity');
assert.deepEqual(Object.keys(esm).sort(), ['MixedText', 'mixText']);

for (const { MixedText } of [esm, cjs]) {
  const html = renderToString(createElement(MixedText, { text: 'A little about who I am:' }));
  const words = [...html.matchAll(/<span [^>]*>([^<]*)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(words, ['A', 'little', 'about', 'who', 'I', 'am:'], 'every word is styled');
  assert.match(html, /^<p style="/, 'renders a paragraph');
  assert.match(html, /font-family:Fraunces/, 'seed 0 starts with the Fraunces variant');
}

assert.equal(typeof globalThis.window, 'undefined', 'ran without a DOM');
console.log('dist OK: ESM + CJS load, exports match, server render works');

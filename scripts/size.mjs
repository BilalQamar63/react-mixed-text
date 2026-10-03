// Reports measured sizes of the built output. "min" runs esbuild's minifier over dist/index.js,
// approximating what a consumer's bundler emits for the whole package (before tree-shaking).
import { readFileSync } from 'node:fs';
import { gzipSync } from 'node:zlib';
import { transform } from 'esbuild';

const kb = (n) => `${(n / 1024).toFixed(2)} kB`;
const code = readFileSync('dist/index.js', 'utf8');
const { code: min } = await transform(code, { minify: true, format: 'esm', target: 'es2022' });
console.log('raw'.padStart(10), 'gzip'.padStart(10), 'min'.padStart(10), 'min+gzip'.padStart(10));
console.log(
  ...[
    Buffer.byteLength(code),
    gzipSync(code).length,
    Buffer.byteLength(min),
    gzipSync(min).length,
  ].map((n) => kb(n).padStart(10)),
);

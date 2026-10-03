// Engineering tool, not a marketing claim: numbers depend entirely on the machine that runs it.
import { performance } from 'node:perf_hooks';
import { mixText } from '../dist/index.js';

const words =
  'programmable typography lets developers style words and characters from a string'.split(' ');
const short = 'A little about who I am:';
const hundred = Array.from({ length: 100 }, (_, i) => words[i % words.length]).join(' ');
const cases = {
  'short sentence (6 words)': () => mixText(short),
  '100 words': () => mixText(hundred),
  '100 words, custom palette and fonts': () =>
    mixText(hundred, { palette: { cream: 'pink' }, fonts: { bebas: 'Anton, sans-serif' } }),
};

const BUDGET_MS = 400;
console.log(`node ${process.version}, ${BUDGET_MS}ms per case after warm-up\n`);
for (const [name, run] of Object.entries(cases)) {
  for (let i = 0; i < 200; i++) run();
  let iterations = 0;
  const start = performance.now();
  while (performance.now() - start < BUDGET_MS) {
    run();
    iterations++;
  }
  const micros = ((performance.now() - start) * 1000) / iterations;
  console.log(
    `${name.padEnd(38)} ${micros.toFixed(1).padStart(8)} µs/op  ${Math.round(1e6 / micros)
      .toLocaleString()
      .padStart(9)} ops/s`,
  );
}

import { readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig({
  plugins: [
    dts({
      tsconfigPath: './tsconfig.build.json',
      bundleTypes: true,
      // One self-contained declaration file serves both module formats.
      afterBuild: () => {
        const types = readFileSync('dist/index.d.ts', 'utf8').replace(/\r\n/g, '\n');
        writeFileSync('dist/index.d.ts', types);
        writeFileSync('dist/index.d.cts', types);
      },
    }),
  ],
  build: {
    target: 'es2022',
    minify: false,
    sourcemap: process.env['SOURCEMAP'] === 'true',
    lib: {
      entry: 'src/index.ts',
      formats: ['es', 'cjs'],
      fileName: (format) => (format === 'es' ? 'index.js' : 'index.cjs'),
    },
    rollupOptions: { external: ['react', 'react/jsx-runtime'] },
  },
});

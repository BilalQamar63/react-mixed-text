import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

// The alias points at the package source so `pnpm dev` works without building first.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: { 'react-mixed-text': fileURLToPath(new URL('../src/index.ts', import.meta.url)) },
  },
});

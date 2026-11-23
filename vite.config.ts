import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    // The page ships almost no JavaScript; make a regression loud instead of silent.
    chunkSizeWarningLimit: 300,
  },
});

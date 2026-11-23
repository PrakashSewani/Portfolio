import react from '@vitejs/plugin-react';
import { execSync } from 'node:child_process';
import { defineConfig, type Plugin } from 'vite';

/** The commit being built: Cloudflare Pages provides it; a local build asks git; otherwise none. */
function buildSha(): { sha: string; fromCi: boolean } {
  if (process.env.CF_PAGES_COMMIT_SHA) return { sha: process.env.CF_PAGES_COMMIT_SHA, fromCi: true };
  try {
    return { sha: execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim(), fromCi: false };
  } catch {
    return { sha: '', fromCi: false };
  }
}

/**
 * Preload the one font file the first paint needs (Archivo, latin, width + weight axes), so the
 * hero's name does not swap in late. The hashed filename is only known once the bundle exists.
 */
function preloadDisplayFont(): Plugin {
  return {
    name: 'preload-display-font',
    apply: 'build',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        const asset = Object.keys(ctx.bundle ?? {}).find((file) => /archivo-latin-wdth-normal.*\.woff2$/.test(file));
        if (!asset) return html;
        return html.replace(
          '</title>',
          `</title>\n    <link rel="preload" href="/${asset}" as="font" type="font/woff2" crossorigin />`,
        );
      },
    },
  };
}

const { sha, fromCi } = buildSha();

export default defineConfig({
  plugins: [react(), preloadDisplayFont()],
  define: {
    __BUILD_SHA__: JSON.stringify(sha),
    __BUILD_SHA_PUBLIC__: JSON.stringify(fromCi),
    __BUILD_DATE__: JSON.stringify(process.env.NODE_ENV === 'production' ? new Date().toISOString() : ''),
  },
  build: {
    target: 'es2022',
    // The page ships very little JavaScript; make a regression loud instead of silent.
    chunkSizeWarningLimit: 300,
  },
});

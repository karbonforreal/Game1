import { defineConfig } from 'vite';
import path from 'node:path';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const dirname = path.dirname(fileURLToPath(import.meta.url));

function cloudflareHeadersPlugin() {
  return {
    name: 'cloudflare-headers-copy',
    closeBundle() {
      const headersSrc = path.resolve(dirname, 'cloudflare', '_headers');
      const headersDest = path.resolve(dirname, 'dist', '_headers');
      if (fs.existsSync(headersSrc)) {
        fs.mkdirSync(path.dirname(headersDest), { recursive: true });
        fs.copyFileSync(headersSrc, headersDest);
      }
    }
  };
}

export default defineConfig({
  plugins: [cloudflareHeadersPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(dirname, 'src')
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  },
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
});

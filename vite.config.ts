
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    allowedHosts: [
      'aqting-backup.vercel.my.id',
      'localhost',
      '.vercel.my.id',
      '.vercel.app'
    ],
  },
});

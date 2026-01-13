
import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    allowedHosts: [
      'aqting-backup.vercel.my.id',
      '.vercel.my.id',
      '.vercel.app'
    ],
    host: true,
  },
});

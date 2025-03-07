import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { cloudflare } from '@cloudflare/vite-plugin';

const isProd = process.env.NODE_ENV === 'production';

export default defineConfig({
  plugins: [cloudflare(), react()],
}); 
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Use the environment variable PORT if provided, otherwise default to 3001
    port: process.env.PORT ? Number(process.env.PORT) : 3001,
  }
});

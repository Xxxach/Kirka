import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

// https://vite.dev/config/
export default defineConfig({
  // На GitHub Pages проектный сайт живёт в подпапке (/Kirka/).
  // Workflow передаёт VITE_BASE; локально по умолчанию '/'.
  base: process.env.VITE_BASE || '/',
  plugins: [react(), tailwindcss()],
});

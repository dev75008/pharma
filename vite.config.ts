import { loadEnv } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { VitePWA } from 'vite-plugin-pwa';
export default defineConfig(({ mode }) => {
 const base = loadEnv(mode, process.cwd(), '').VITE_BASE_PATH || '/';
 return { base, build: { rolldownOptions: { output: { codeSplitting: { groups: [{name:'math-vendor',test:/katex|dompurify/,priority:20},{ name: 'vendor', test: /node_modules/,priority:10 }] } } } }, plugins: [react(), tailwindcss(), VitePWA({ registerType: 'prompt', manifest: { name: 'MEDREVISION', short_name: 'Medrevision', lang: 'fr', description: 'Espace personnel de révision médicale', theme_color: '#123e67', background_color: '#f4f7fb', display: 'standalone', start_url: base, scope: base, icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' }] }, workbox: { globPatterns: ['**/*.{js,css,html,svg,png,woff2}'], navigateFallback: 'index.html' } })], test: { environment: 'jsdom', setupFiles: './src/test/setup.ts', include: ['src/**/*.test.{ts,tsx}'] } };
});

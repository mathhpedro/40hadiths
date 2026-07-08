import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// Relative base so the built app works on any static host, including
// GitHub Pages project sites served from a sub-path (e.g. /40hadiths/).
export default defineConfig({
  base: './',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/favicon.svg', 'icons/apple-touch-icon.png'],
      manifest: {
        name: '40 Hadiths — An-Nawawi',
        short_name: '40 Hadiths',
        description:
          'Estudo dos 40 Hadiths de An-Nawawi: árabe, transliteração e tradução (PT/EN), memorização e modo aula.',
        lang: 'pt-BR',
        dir: 'ltr',
        start_url: './',
        scope: './',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#04140f',
        theme_color: '#04140f',
        categories: ['education', 'books', 'lifestyle'],
        icons: [
          { src: 'icons/pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icons/pwa-512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'icons/pwa-maskable-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,png,woff,woff2}'],
        // The bundled hadith data + fonts can push past the default 2 MiB cap.
        maximumFileSizeToCacheInBytes: 6 * 1024 * 1024,
        cleanupOutdatedCaches: true,
      },
    }),
  ],
})

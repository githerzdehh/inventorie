import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vuetify from 'vite-plugin-vuetify'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vuetify({ autoImport: true }),
    VitePWA({
      registerType: 'prompt',
      manifest: {
        name: 'Inventorie',
        short_name: 'Inventorie',
        description: 'From scan to recipe, all in one vault.',
        theme_color: '#C8798C',
        background_color: '#FFFAF6',
        display: 'standalone',
        start_url: '/',
        icons: [
          {
            src: '/icons/inventorie-logo-icon-blue-180x180.png',
            sizes: '180x180',
            type: 'image/png',
          },
          {
            src: '/icons/inventorie-logo-icon-blue-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
})

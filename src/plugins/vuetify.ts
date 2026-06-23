import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import { createVuetify } from 'vuetify'
import { aliases, mdi } from 'vuetify/iconsets/mdi'

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases,
    sets: {
      mdi,
    },
  },
  theme: {
    defaultTheme: 'inventorieLight',
    themes: {
      inventorieLight: {
        dark: false,
        colors: {
          primary: '#C8798C',
          'on-primary': '#ffffff',
          secondary: '#E8BFA3',
          'on-secondary': '#352B2E',
          accent: '#9FBBC3',
          'on-accent': '#352B2E',
          success: '#7CA982',
          'on-success': '#ffffff',
          warning: '#D8AE5E',
          'on-warning': '#352B2E',
          error: '#D98273',
          'on-error': '#ffffff',
          background: '#FFFAF6',
          surface: '#FFFFFF',
          'primary-dark': '#A85D70',
          'primary-soft': '#F8E6EB',
          'secondary-soft': '#FFF1E8',
          'accent-dark': '#6F99A5',
          'accent-soft': '#EAF5F7',
          'surface-soft': '#FFF4EF',
          'text-main': '#352B2E',
          'text-muted': '#7B6F73',
          border: '#EADDE0',
        },
      },
    },
  },
})

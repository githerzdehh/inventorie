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
          primary: '#020BDF',
          'on-primary': '#ffffff',
          secondary: '#F9AA11',
          'on-secondary': '#111111',
          accent: '#F18E06',
          'on-accent': '#111111',
          success: '#020BDF',
          'on-success': '#ffffff',
          warning: '#F9AA11',
          'on-warning': '#111111',
          error: '#F18E06',
          'on-error': '#ffffff',
          background: '#FFFAF0',
          surface: '#FFFFFF',
          'primary-dark': '#01068F',
          'primary-soft': '#FFEEAB',
          'secondary-soft': '#FFF4D6',
          'accent-dark': '#B56400',
          'accent-soft': '#FFE7BF',
          'surface-soft': '#FFEEAB',
          'text-main': '#111111',
          'text-muted': '#4F4F4F',
          border: '#F9AA11',
        },
      },
    },
  },
})

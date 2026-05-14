import { defineConfig } from 'vite'
import preact from '@preact/preset-vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [preact(), tailwindcss()],
  server: {
    proxy: {
      '/shorten': 'https://shrt.qd.je',
      '/r': 'https://shrt.qd.je',
    },
  },
})

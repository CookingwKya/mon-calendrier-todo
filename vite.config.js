import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mon-calendrier-todo/', // REMPLACEZ par votre nom de repo exact
  build: {
    outDir: 'dist'
  },
  server: {
    host: true
  }
})
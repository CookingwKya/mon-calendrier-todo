import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mon-calendrier-todo/', // IMPORTANT: Remplacez par le nom de votre repo
  server: {
    host: true
  }
})
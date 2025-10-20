import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/mon-calendrier-todo/', // ⚠️ Vérifiez que c'est le bon nom de repo
  build: {
    outDir: 'dist'
  },
  server: {
    host: true
  }
})


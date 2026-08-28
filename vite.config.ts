import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig(({ command }) => ({
  // GitHub Pages serveert de app onder de repositorynaam.
  base: command === 'build' ? '/WiezeScoren/' : '/',
  plugins: [react(), tailwindcss()],
  // Het project staat op een Windows-schijf; onder WSL komen daar geen inotify-events vandaan.
  server: { watch: { usePolling: true } },
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
  },
}))

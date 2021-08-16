import { resolve } from 'path'
import { defineConfig } from 'vite'
import react from 'vite-preset-react'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [{ find: '@', replacement: resolve(__dirname, 'src') }],
  },
  build: {
    sourcemap: true,
  },
})

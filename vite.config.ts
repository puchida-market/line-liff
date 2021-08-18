import { defineConfig, UserConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import react from 'vite-preset-react'

// https://vitejs.dev/config/
const config: UserConfig = {
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: [
      {
        find: '@pages',
        replacement: `${__dirname}/src/pages`
      },
      {
        find: '@layouts',
        replacement: `${__dirname}/src/layouts`
      },
      {
        find: '@components',
        replacement: `${__dirname}/src/components`
      },
      {
        find: '@styles',
        replacement: `${__dirname}/src/styles`
      },
      {
        find: '@services',
        replacement: `${__dirname}/src/services`
      },
      {
        find: '@models',
        replacement: `${__dirname}/src/models`
      },
      {
        find: '@stores',
        replacement: `${__dirname}/src/stores`
      },
      {
        find: '@libs',
        replacement: `${__dirname}/src/libs`
      },
      {
        find: '@utils',
        replacement: `${__dirname}/src/utils`
      },
      {
        find: '@context',
        replacement: `${__dirname}/src/context`
      }
    ]
  },
  build: {
    sourcemap: true
  }
}

export default defineConfig(config)

import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'
import { resolve } from 'path'

export default defineConfig({
  plugins: [
    dts({
      // Automatically generate .d.ts files from src/
      insertTypesEntry: true,
      include: ['src/**/*'],
    }),
  ],
  build: {
    // Library mode — output is a consumable package, not an app
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'VizFlow',
      // Generate both ESM and CJS bundles
      formats: ['es', 'cjs'],
      fileName: format => `index.${format === 'es' ? 'js' : 'cjs'}`,
    },
    rollupOptions: {
      // Mark Chart.js as external — consumers install it themselves
      external: ['chart.js'],
      output: {
        globals: {
          'chart.js': 'Chart',
        },
      },
    },
    // Clean dist/ before every build
    emptyOutDir: true,
  },
})

import { fileURLToPath, URL } from 'node:url'
import { resolve } from 'path';
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
// import { nodePolyfills } from 'vite-plugin-node-polyfills'

// https://vitejs.dev/config/
export default defineConfig({
  envPrefix: ['BACKEND_', 'VITE_'],
  plugins: [
    vue(),
    // nodePolyfills({
    //   include: ['stream', 'buffer', 'util']
    // }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '~shared': resolve(__dirname, './../shared'),
    }
  }
})

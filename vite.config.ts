import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from "vite-plugin-singlefile"

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [vue(), viteSingleFile({inlinePattern: ["*.css"]})],
    build: {
      assetsDir: '.',   // create only one layer of directory structure
      cssCodeSplit: true
    },
    define: {
      __BUILD_TIME__: JSON.stringify(new Date().toISOString())
    }
  }
})

import { defineConfig } from 'vite'
import { fileURLToPath, URL } from 'node:url'
import vue from '@vitejs/plugin-vue'
import { viteSingleFile } from "vite-plugin-singlefile"
import removeConsole from "vite-plugin-remove-console";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  return {
    plugins: [vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => ['video-js'].includes(tag)    // video-js is custom component
        }
      }
    }), viteSingleFile({inlinePattern: ["*.css"]}), removeConsole({ includes: ["log"]})],
    build: {
      assetsDir: '.',   // create only one layer of directory structure
      cssCodeSplit: true,
    },
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url))
      }
    },
    define: {
      // declare it in env.d.ts, otherwise won't build
      __BUILD_TIME__: JSON.stringify(new Date().toISOString()),   // https://vitejs.dev/config/shared-options.html
    },
  }
})

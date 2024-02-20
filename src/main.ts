import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from './router'
import App from './App.vue';

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

console.warn("main.ts built....on " + __BUILD_TIME__, "ver:"+import.meta.env.VITE_APP_VERSION)
app.mount("#app")

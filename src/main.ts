import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useLeither, useMimei } from './stores/lapi';
import { router } from './router'
import App from './App.vue';

// import"bootstrap/dist/css/bootstrap.min.css"
// import"bootstrap"

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)

useMimei().init(useLeither())
console.warn("main.ts built....on " + __BUILD_TIME__)
app.mount("#app")

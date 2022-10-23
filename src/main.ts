import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useLeither, useMimei } from './stores/lapi';
import { router } from './router'
import App from './App.vue';

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.config.unwrapInjectedRef=true       // temp setting until ver 3.3
app.use(router)
try {
    await useMimei().init(useLeither())
    app.mount("#app")    
} catch(e) {
    console.error(e)
}

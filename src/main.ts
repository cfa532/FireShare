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
useMimei().init(useLeither()).then(()=>{
    console.warn("main.ts loaded....on Nov 4.")
    app.mount("#app")
}, (err)=>{
    console.error(err)
})
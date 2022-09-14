import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useLeither } from './stores/lapi';
import App from './App.vue';
import { router } from './router'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.config.unwrapInjectedRef=true       // temp setting until ver 3.3
app.use(router)
useLeither().login().then(()=>app.mount("#app"),
    (err: Error)=>{
        console.error("Login err=", err)
    })

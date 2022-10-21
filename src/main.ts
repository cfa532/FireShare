import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { useLeither } from './stores/lapi';
import { router } from './router'
import App from './App.vue';

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.config.unwrapInjectedRef=true       // temp setting until ver 3.3
// console.log(app.config)
app.use(router)
useLeither().login().then(()=>{
    console.log("MOUNT APP")
    app.mount("#app")
},
    (err: Error)=>{
        console.error("Login err=", err)
    })

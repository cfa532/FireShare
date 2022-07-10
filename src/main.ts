import { createApp } from 'vue'
import App from './App.vue'
import { getLApi, getLocalApiHandler } from './auth.js';

getLApi().then((api:any)=>{
    // window.lapi = api
    let app = createApp(App)
    app.provide("lapi", api)    // global Leither apiHandler
    app.config.unwrapInjectedRef=true       // temp setting until ver 3.3
    app.mount("#app")
}, (err:Error)=> {
    console.error("Error getLapi", err)
})
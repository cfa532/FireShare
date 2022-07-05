import { createApp } from 'vue'
import App from './App.vue'
import { getLocalApiHandler } from './auth.js'

getLocalApiHandler().then((api:any)=>{
    window.lapi = api
    createApp(App).mount("#app")
})


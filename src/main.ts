import { createApp } from 'vue'
import App from './App.vue'
import { getLApi } from './auth.js';

const Home = {template: ''}
const Uploader = {}
const routes = [
    { path: '/', component: Home},
    { path: '/upload', component: Uploader}
]
const router = VueRouter.
getLApi().then((api:any)=>{
    // window.lapi = api
    let app = createApp(App)
    app.provide("lapi", api)    // global Leither apiHandler
    app.config.unwrapInjectedRef=true       // temp setting until ver 3.3
    app.mount("#app")
}, (err:Error)=> {
    console.error("Error getLapi", err)
})
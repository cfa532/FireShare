import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { getLApi } from './auth';
import App from './App.vue'
import FileListVue from './components/FileList.vue';
import MainPageVue from './components/MainPage.vue';
import FileViewVue from './components/FileView.vue';
// const FileViewVue = ()=> import('./components/FileView.vue')       //lazy load

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    routes: [
        { path: '/', name:"main", component: MainPageVue},
        { path: '/filelist', name:"filelist", component: FileListVue},
        { path: '/fileview/:macid/:fileType', name:"fileview", component: FileViewVue}
    ],
})

getLApi().then((api:any)=>{
    // window.lapi = api
    let app = createApp(App)
    app.provide("lapi", api)    // global Leither apiHandler
    app.config.unwrapInjectedRef=true       // temp setting until ver 3.3
    app.use(router)
    app.mount("#app")
}, (err:Error)=> {
    console.error("Error getLapi", err)
})
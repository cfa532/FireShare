import { createApp } from 'vue'
import { createRouter, createWebHashHistory } from 'vue-router'
import { getLApi } from './auth';
import App from './App.vue'
import FileListVue from './components/FileList.vue';
import MainPageVue from './components/MainPage.vue';
import FileViewVue from './components/FileView.vue';        // Mac file within a MM
import FileView2Vue from './components/FileView2.vue';      // view files in webdav
// const FileViewVue = ()=> import('./components/FileView.vue')       //lazy load

const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    routes: [
        { path: '/', name:"main", component: MainPageVue},
        { path: '/filelist', name:"filelist", component: FileListVue},
        { path: '/fileview/:macid/:fileType', name:"fileview", component: FileViewVue},
        { path: '/fileview2/:filePath', name:"fileview2", component: FileView2Vue, props:route=>{route.query.filePath}},
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
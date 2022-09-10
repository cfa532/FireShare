import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHashHistory } from 'vue-router';
// import { getLApi } from './auth';
import { useLeither } from './stores/lapi';
import App from './App.vue';
import FileListVue from './components/FileList.vue';
import MainPageVue from './components/MainPage.vue';
import FileViewVue from './components/FileView.vue';        // Mac files within a MM
import FileView2Vue from './components/FileView2.vue';      // view files in webdav under Leither
// const FileViewVue = ()=> import('./components/FileView.vue')       //lazy load, may cause error in Leither

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
const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.config.unwrapInjectedRef=true       // temp setting until ver 3.3
app.use(router)
await useLeither().login()
app.mount("#app")

// useLeither().getLApi().then((api:any)=>{
//     // window.lapi = api
//     // app.provide("lapi", api)    // global Leither apiHandler
//     app.mount("#app")
// }, (err:Error)=> {
//     console.error("Error getLapi", err)
// })
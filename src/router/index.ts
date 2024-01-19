import { createRouter, createWebHashHistory } from "vue-router";
import { useSpinner } from "../stores/lapi";
import FileListVue from '../components/FileList.vue';
import MainPageVue from '../components/MainPage.vue';
import FileViewVue from '../components/FileView.vue';        // Mac files within a MM database
import FileView2Vue from '../components/FileView2.vue';      // view files in /webdav under Leither
import FileView3Vue from '../components/FileView3.vue';      // view mm files
import Login from '../components/Login.vue';
import IPs from '../views/IPs.vue'

// const MainPageVue = ()=>import('../components/MainPage.vue')
export const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    linkActiveClass: 'active',
    routes: [
        { path: '/', name:"main", component: MainPageVue},
        { path: '/login', name:"login", component: Login},
        { path: '/ips', name:"ips", component: IPs},
        { path: '/filelist/:title/:page?', name:"filelist", component: FileListVue,
            // beforeEnter: (to, from)=>{
            //     const s = useSpinner().setLoadingState(true);
            //     console.log("Before entering filelist", to.path)
            // }
        },
        { path: '/fileview/:title/:mid/:fileType/:fileName?', name:"fileview", component: FileViewVue,
            beforeEnter: (to)=>{
                const reg = /r=0.\d+/i
                console.log(to.fullPath)
                if (to.fullPath.search(reg) > -1) {
                    // update random number in the URL
                    to.fullPath = to.fullPath.replace(reg, "r=0."+Date.now())
                } else
                    to.fullPath += "?r=0." + Date.now()
            }
        },    // mimei files
        { path: '/fileview2/:title/:filePath', name:"fileview2", component: FileView2Vue},      // local webdav files
        { path: '/fileview3/:tpt/:id', name:"fileview3", component: FileView3Vue},              // ipfs id list
        // catch all redirect to home page
        { path: '/:pathMatch(.*)*', redirect: '/' },
        // { path: '/checkBot', name:'botCheck', component: BotCheck},
    ],
});

// router.beforeEach(async (to) => {
//     // before each route change, check user authority
//     if (to.name === "fileview") {
//         const reg = /r=0.\d+/i
//         console.log(to.fullPath.search(reg))
//         if (to.fullPath.search(reg) > -1) {
//             // update random number in the URL
//             to.fullPath = to.fullPath.replace(reg, "r=0."+Date.now())
//         } else
//             to.fullPath += "?r=0." + Date.now()
//     }
// })
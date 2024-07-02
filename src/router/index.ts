import { createRouter, createWebHashHistory } from "vue-router";
import { FileList, MainPage, IPs} from "../views/index"

export const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    linkActiveClass: 'active',
    routes: [
        { path: '/', name:"main", component: MainPage},
        { path: '/ips', name:"ips", component: IPs},
        { path: '/filelist/:title/:page?', name:"filelist", component: FileList,},
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
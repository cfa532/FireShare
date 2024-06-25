import { createRouter, createWebHashHistory } from "vue-router";
import { FileList, FileView, FileView2, FileView3, MainPage, IPs} from "../views/index"

export const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    linkActiveClass: 'active',
    routes: [
        { path: '/', name:"main", component: MainPage},
        { path: '/ips', name:"ips", component: IPs},
        { path: '/filelist/:title/:page?', name:"filelist", component: FileList,},
        { path: '/fileview/:title/:mid/:fileType/:fileName?', name:"fileview", component: FileView,
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
        { path: '/fileview2/:filePath', name:"fileview2", component: FileView2},      // local webdav files
        { path: '/fileview3/:tpt/:id', name:"fileview3", component: FileView3},              // ipfs id list
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
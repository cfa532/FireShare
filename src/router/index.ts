import { createRouter, createWebHashHistory } from "vue-router";
import { useLeither } from "../stores/lapi";
import FileListVue from '../components/FileList.vue';
import MainPageVue from '../components/MainPage.vue';
import FileViewVue from '../components/FileView.vue';        // Mac files within a MM
import FileView2Vue from '../components/FileView2.vue';      // view files in webdav under Leither

export const router = createRouter({
    // 4. Provide the history implementation to use. We are using the hash history for simplicity here.
    history: createWebHashHistory(),
    linkActiveClass: 'active',
    routes: [
        { path: '/', name:"main", component: MainPageVue},
        { path: '/filelist/:page?', name:"filelist", component: FileListVue},
        { path: '/fileview/:macid/:fileType', name:"fileview", component: FileViewVue},
        { path: '/fileview2/:filePath', name:"fileview2", component: FileView2Vue},
        // catch all redirect to home page
        { path: '/:pathMatch(.*)*', redirect: '/' }
    ],
});

router.beforeEach(async (to) => {
    const authLeither = useLeither();
    // before each route change, check use authority
})
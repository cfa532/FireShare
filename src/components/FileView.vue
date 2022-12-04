<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useLeither, useMimei } from '../stores/lapi';
import NaviBarVue from './NaviBar.vue';
import MyImg from './Gadget/Image.vue';
import MyPdf from './Gadget/pdf.vue';
import VideoPlayer from './Gadget/VideoJS.vue';
import Page from './Gadget/Html.vue';
import ShareVue from './Gadget/Share.vue';
import { computed, onMounted } from "vue";
import { router } from '../router';

const api = useLeither()
const mmInfo = useMimei()
const route = useRoute()
const fileType = route.params.fileType as string;
const userComponent = computed(() => {
    if (fileType.includes("image")) {
        return MyImg
    } else if (fileType.includes("pdf")) {
        return MyPdf
    } else if (fileType.includes("video") || fileType.includes("audio") ) {
        return VideoPlayer
    } else if (fileType.includes("page")) {
        // webpage that includes text and files
        return Page
    } else {
        console.warn("Unknown file type:", fileType)
    }
})
const currentProperty = route.params    // params: {macid:file.macid, fileType:file.type}}
onMounted(async ()=>{
    await mmInfo.init(api)
    console.log("FileView mounted,", route.params, await mmInfo.mmsid)
})
async function deleteFile() {
    try {
        let mmsidCur = await mmInfo.mmsidCur;
        console.trace("b3gin")
        api.client.Zrem(mmsidCur, route.params.title, route.params.macid, (ret:number)=>{
            console.trace()
            console.log("Zrem ret=", ret, mmsidCur, route.params)
            mmInfo.backup()
            // redirect to parent FileList
            router.push({
                name: "filelist", params:{page:1, title: route.params.title}
            });
        }, (err: Error) => {
            console.error("Zrem error=", err)
        })
    } catch(err) {
        console.error(err);
    }
}
</script>

<template>
    <NaviBarVue :column="(route.params.title as string)"></NaviBarVue>
    <!-- <hr/> -->
    <ShareVue @delete-file="deleteFile"  ref="shareMenu" v-bind="currentProperty"></ShareVue>
    <KeepAlive>
        <component :is="userComponent" v-bind="currentProperty"></component>
    </KeepAlive>
</template>

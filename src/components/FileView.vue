<script setup lang="ts">
import { computed, onMounted } from "vue";
import { router } from '../router';
import { useRoute } from 'vue-router';
import { useLeither, useMimei, useSpinner } from '../stores/lapi';
import NaviBarVue from './NaviBar.vue';
import MyImg from './Gadget/Image.vue';
import MyPdf from './Gadget/pdf.vue';
import VideoPlayer from './Gadget/VideoJS.vue';
import Page from './Gadget/Html.vue';
import ShareVue from './Gadget/Share.vue';
import SpinnerVue from "./Gadget/Spinner.vue";

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
const currentProperty = computed(()=>route.params)    // params: {macid:file.macid, fileType:file.type}}

onMounted(async ()=>{
    await mmInfo.init(api)
    console.log("FileView mounted,", route.params)
    useSpinner().setLoadingState(false)
})
async function deleteFile() {
    try {
        api.client.Zrem(await mmInfo.mmsidCur, route.params.title, route.params.macid, async (ret:number)=>{
            console.log("Zrem ret=", ret)
            mmInfo.backup()
            // redirect to parent FileList
            router.push({name: "filelist", params:{page:1, title: route.params.title}});
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
    <SpinnerVue :active="useSpinner().loading" message="Please wait......"/>
    <!-- <hr/> -->
    <ShareVue @delete-file="deleteFile"  ref="shareMenu" v-bind="currentProperty"></ShareVue>
    <KeepAlive>
        <component :is="userComponent" v-bind="currentProperty"></component>
    </KeepAlive>
</template>

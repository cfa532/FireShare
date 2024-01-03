<script setup lang="ts">
import { computed, onMounted } from "vue";
import { router } from '../router';
import { useRoute } from 'vue-router';
import { useLeither, useMimei, useSpinner } from '../stores/lapi';
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
        return "<p>Unkonwn file type</P>"
    }
})
const currentProperty = computed(()=>route.params)    // params: {mid:file.mid, fileType:file.type}}

onMounted(async ()=>{
    // check session sanity
    if (sessionStorage["isBot"] == undefined) {
        // first time open the page
        const r = Math.floor(Math.random()*90+10).toString()
        // let isBot = "OK"
        let isBot = prompt("Say friend and enter "+r+":")
        console.log(isBot)
        if (!isBot) {
            // redirect to main page
            router.push("/")
        } else {
            isBot==r? sessionStorage["isBot"] = "Human" : router.push("/")
            // proceed
        }
        // alert(navigator.userAgent)
        useSpinner().setLoadingState(false)
    } else {
        await mmInfo.init(api)
        console.log("FileView mounted,", route.params)
        document.title = import.meta.env.VITE_PAGE_TITLE+' - '+(route.params.fileName? route.params.fileName as string : route.params.title as string)
        useSpinner().setLoadingState(false)
    }
})
async function deleteFile() {
    try {
        api.client.Zrem(await mmInfo.mmsidCur, route.params.title, route.params.mid, async (ret:number)=>{
            console.log("Zrem ret=", ret)
            await mmInfo.backup()
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
    <SpinnerVue :active="useSpinner().loading" text="Please wait......"/>
    <!-- <hr/> -->
    <ShareVue @delete-file="deleteFile"  ref="shareMenu" v-bind="currentProperty"></ShareVue>
    <KeepAlive>
        <component :is="userComponent" v-bind="currentProperty"></component>
    </KeepAlive>
</template>

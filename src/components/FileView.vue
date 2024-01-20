<script setup lang="ts">
import { computed, onMounted, shallowReactive, ref } from "vue";
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
const touchedDiv =ref<HTMLDivElement>()
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
// params: {mid:file.mid, fileType:file.type}}
route.params["delRef"] = "false"    // tell child comp to delete reference when deleting post
const currentProperty = shallowReactive(route.params)

onMounted(async ()=>{
    // check session sanity
    // const r = Math.floor(Math.random()*90+10).toString()
    // assign it early otherwise title will be empty in Wechat.
    document.title = (route.params.fileName? route.params.fileName as string : route.params.title as string)
                    +' - '+import.meta.env.VITE_PAGE_TITLE
    if (!sessionStorage["isBot"]) {
        confirm("如果在微信中转发，请点击右上角的\u2022\u2022\u2022") ? sessionStorage["isBot"] = "No" : history.go(-1)
        useSpinner().setLoadingState(false)
    } else {
        console.log("FileView mounted,", route.params)
        useSpinner().setLoadingState(false)
    }
})
async function deleted() {
    // reference of Mimei or IPFS file has been deleted in child component
    try {
        await mmInfo.init(api)
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
let posXStart = -1
function touchStart(touchEvent: TouchEvent) {
    // console.log(touchEvent)
    // if (touchEvent.changedTouches.length !== 1) {
    //     return      // only handle one finger touch
    // }
    // posXStart = touchEvent.changedTouches[0].clientX
    // addEventListener('touchend', touchEvent=>this.touchend(touchEvent, posXStart), {once:true})
}
function touchEnd(touchEvent: TouchEvent) {
    // console.log(touchEvent)
    // if (touchEvent.changedTouches.length !== 1) {
    //     return      // only handle one finger touch
    // }
    // const posXEnd = touchEvent.changedTouches[0].clientX
    // if (posXStart < posXEnd) {
    //     // swipe right
    // } else if (posXStart > posXEnd) {
    //     // swipe left
    // }
}
</script>

<template>
    <SpinnerVue :active="useSpinner().loading" text="Please wait......"/>
    <!-- Delete page function is in the Share Menu -->
    <ShareVue @delete-post='currentProperty["delRef"] = "true"'></ShareVue>
    <div ref="touchedDiv" @touchstart.prevent="touchStart" @touchend.prevent="touchEnd">
        <KeepAlive>
            <component @deleted="deleted" :is="userComponent" v-bind="currentProperty"></component>
        </KeepAlive>
    </div>
</template>

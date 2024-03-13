<script setup lang="ts">
import { computed, onMounted, shallowReactive } from "vue";
import { router } from '../router';
import { useRoute } from 'vue-router';
import { useLeither, useMimei, useSpinner } from '../stores/lapi';
import { Html as Page, ShareMenu, Spinner, Image, PDFView, VideoJS } from '../components/index'

const api = useLeither()
const mmInfo = useMimei()
const route = useRoute()
// params: {mid:file.mid, fileType:file.type}}
route.params["delRef"] = "false"    // tell child comp to delete reference when deleting post
const params = shallowReactive(route.params)

const userComponent = computed(() => {
    if (params.fileType.includes("image")) {
        return Image
    } else if (params.fileType.includes("pdf")) {
        return PDFView
    } else if (params.fileType.includes("video") || params.fileType.includes("audio") ) {
        return VideoJS
    } else if (params.fileType.includes("page")) {
        // webpage that includes text and files
        return Page
    } else {
        console.warn("Unknown file type:", params.fileType)
        return "<p>Unkonwn file type</P>"
    }
})

onMounted(()=>{
    // check session sanity
    // const r = Math.floor(Math.random()*90+10).toString()
    // assign it early otherwise title will be empty in Wechat.
    document.title = (params.fileName? params.fileName as string : params.title as string)
                    +' - '+import.meta.env.VITE_PAGE_TITLE
    useSpinner().setLoadingState(false)
    if (!sessionStorage["isBot"]) {
        confirm("如果在微信中转发，请点击右上角的\u2022\u2022\u2022") ? sessionStorage["isBot"] = "No" : history.go(-1)
    }
    console.log("FileView mounted,", params)
})
async function deleted() {
    // reference of Mimei or IPFS file has been deleted in child component.
    // now delete the post itself.
    useSpinner().setLoadingState(true)
    await api.client.Zrem(await mmInfo.mmsidCur, params.title, params.mid)
    await mmInfo.backup()
    useSpinner().setLoadingState(false)

    // redirect to parent FileList
    router.push({name: "filelist", params:{page:1, title: params.title}});
}
function touchStart(touchEvent: TouchEvent) {
    if (touchEvent.changedTouches.length !== 1) {
        return      // only handle one finger touch
    }
    console.log(touchEvent)
    const posXStart = touchEvent.changedTouches[0].clientX
    addEventListener('touchend', touchEvent=>{
        if (touchEvent.changedTouches.length !== 1) {
            return      // only handle one finger touch
        }
        const posXEnd = touchEvent.changedTouches[0].clientX
        if (posXStart < posXEnd-50) {
            // swipe right
            swiped(1)
        } else if (posXStart > posXEnd+50) {
            swiped(-1)
        }
    }, {once:true})
}
function swiped(direction: number) {
    const fis = JSON.parse(sessionStorage["fileList"])
    if (!fis)
        return
    const ni = fis.index - direction    // direction is counter-intuitive
    console.log(ni, fis)
    if (ni < Math.min(fis.pageSize, fis.posts.length) && ni>=0 ) {
        fis.index = ni
        sessionStorage["fileList"] = JSON.stringify(fis)
        const fi = fis.posts[ni]
        params.mid = fi.mid
        params.fileType = fi.type
        params.fileName = fileName(fi)
        delete route.params.delRef      // to silence a warning message
        // router.push({name: "fileview", params: params})  // changes to params will triger the child component to refresh
        console.log(params, userComponent.value)
    }
}
function fileName(file: FileInfo):string {
    // console.log(file)
    return file.caption? file.caption : file.name;
}
</script>

<template>
    <div class="container-fluid text-left topm">
        <div class="row justify-content-start">
            <Spinner :active="useSpinner().loading" text="Please wait......" />
            <!-- Delete page function is in the Share Menu -->
            <ShareMenu v-if="api.sid" @delete-post='params["delRef"] = "true"'></ShareMenu>
            <div class="col-sm-12 col-md-10 col-lg-6" @touchstart="touchStart">
                <!-- do not use Prevent. Otherwise vertical scroll will be disabled. -->
                <KeepAlive>
                    <component @deleted="deleted" :is="userComponent" v-bind="params"></component>
                </KeepAlive>
            </div>
        </div>
    </div>
</template>
<style>
.topm {
    margin-top: 10px;
}
</style>

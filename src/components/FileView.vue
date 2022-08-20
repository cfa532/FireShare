<script setup lang="ts">
import { inject, ref, onMounted, reactive } from 'vue';
import { useRoute } from 'vue-router';
import NaviBarVue from './NaviBar.vue';
import * as pdfobject from 'pdfobject'
import VideoPlayer from './VideoJS.vue'
// const VideoPlayer = defineAsyncComponent(()=>
//     import('./VideoJS.vue')
// )
const api: any = inject("lapi");    // Leither api handler
const route = useRoute()
// const props = defineProps({
//     macid: {type: String, required: true},
//     fileType: {type: String, required: true}
// })
const column = JSON.parse(localStorage.getItem("currentColumn") as string)
const fileType = route.params.fileType as string;
const pdf = ref(pdfobject)
const ImgUrl = ref("")
const videoOptions = reactive({
    autoplay: true,
    controls: true,
    sources: [] as Array<{ src: string, type: string }>
})
// const AsyncVideo = defineAsyncComponent(() => 
//     import('./VideoJS.vue')
// )
onMounted(() => {
    console.log(column, route.params, pdfobject)
    getLink()
});
function getLink() {
    api.client.MFOpenMacFile(api.sid, api.mid, route.params.macid, (fsid: string) => {
        console.log("Open file fsid=", fsid)
        api.client.MFGetData(fsid, 0, -1, (buf: ArrayBuffer) => {
            // arraybuffer
            const blob = new Blob([buf], { type: fileType as string });
            // const blob = new Blob([buf], { type: 'application/octet-stream' });
            const objUrl = URL.createObjectURL(blob)
            console.log(objUrl, fileType)
            if (fileType.includes("image")) {
                ImgUrl.value = objUrl
            } else if (fileType.includes("pdf")) {
                pdfobject.embed(objUrl, "#pdfviewer", { height: "60rem" })
                // pdf.value.data = objUrl
            } else if (fileType.includes("video")) {
                // videoSrc.value = {src: objUrl, type: fileType}
                videoOptions.sources = [{ src: objUrl, type: fileType }]
            }
        }, (err: Error) => {
            console.error("Get File data error=", err)
        })
    }, (err: Error) => {
        console.error("Open file error=", err)
    })
}
</script>

<template>
    <NaviBarVue :column=column.titleZh></NaviBarVue>
    <hr />
    <div v-if="fileType.includes('image')">
        <img style="max-width: 100%; height: 95vh; object-fit: contain;" :src="ImgUrl" />
    </div>
    <div style="width: 100%;" id="pdfviewer" v-else-if="fileType.includes('pdf')">
        <object ref="pdf" :type=fileType style="width: 100%" />
    </div>
    <div v-else-if="fileType.includes('video')"
        style=" overflow: hidden;">
        <VideoPlayer :options="videoOptions" />
        <!-- <objectc :type=fileType
        width='800px' 
        height='600px' /> -->
    </div>
</template>

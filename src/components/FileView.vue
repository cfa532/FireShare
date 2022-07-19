<script setup lang="ts">
import { inject, ref, onMounted, defineAsyncComponent, onBeforeMount, VueElement, createApp, watch, reactive } from 'vue';
import { useRoute } from 'vue-router';
import NaviBarVue from './NaviBar.vue';
import * as pdfobject from 'pdfobject'
import VideoPlayer from './VideoJS.vue'

const api: any = inject("lapi");    // Leither api handler
const route = useRoute()
// const props = defineProps({
//     macid: {type: String, required: true},
//     fileType: {type: String, required: true}
// })
const column = JSON.parse(localStorage.getItem("currentColumn") as string)
const fileType = route.params.fileType as string;
const img = ref(HTMLImageElement as any)     // Composition API to access DOM
const pdf = ref(pdfobject)
// const video = ref({} as HTMLObjectElement)
let videoSrc = ref({src:"", type:""})
// const AsyncVideo = defineAsyncComponent(() => 
//     import('./VideoJS.vue')
// )
const video = ref(VideoPlayer)
onMounted(()=>{
    console.log(column, route.params, pdfobject)
    getLink()
});
function getLink() {
    api.client.MFOpenMacFile(api.sid, api.mid, route.params.macid, (fsid:string)=>{
        console.log("Open file fsid=", fsid)
        api.client.MFGetData(fsid, 0, -1, (buf:ArrayBuffer)=>{
            // arraybuffer
            const blob = new Blob([buf], { type: fileType as string });
            // const blob = new Blob([buf], { type: 'application/octet-stream' });
            const objUrl = URL.createObjectURL(blob)
            console.log(objUrl, fileType)
            if (fileType.includes("image")) {
                img.value.src = objUrl
            } else if (fileType.includes("pdf")) {
                pdfobject.embed(objUrl, "#pdfviewer", {height: "60rem"})
                // pdf.value.data = objUrl
            } else if (fileType.includes("video")) {
                videoSrc.value = {src: objUrl, type: fileType}
            }
        }, (err:Error)=>{
            console.error("Get File data error=", err)
        })
    }, (err:Error)=>{
        console.error("Open file error=", err)
    })

}
</script>

<template>
<NaviBarVue :column=column.titleZh></NaviBarVue>
<hr/>
<div v-if="fileType.includes('image')">
    <img ref="img" />
</div>
<div id="pdfviewer" v-else-if="fileType.includes('pdf')">
    <object ref="pdf" :type=fileType
        width='100%' 
        height='900px' />
</div>
<div v-else-if="fileType.includes('video')">
    <VideoPlayer ref="video" :src="videoSrc.src" :type="videoSrc.type" />
    <!-- <AsyncVideo ref="video"></AsyncVideo> -->
    <!-- <objectc :type=fileType
        width='800px' 
        height='600px' /> -->
</div>
</template>

<style>
.pdfobject-container { height: 60rem; border: 1rem solid rgba(0,0,0,.1); }
</style>
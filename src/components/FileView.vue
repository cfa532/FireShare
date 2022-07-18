<script setup lang="ts">
import { inject, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NaviBarVue from './NaviBar.vue';

const api: any = inject("lapi");    // Leither api handler
const route = useRoute()
// const props = defineProps({
//     macid: {type: String, required: true},
//     fileType: {type: String, required: true}
// })
const column = JSON.parse(localStorage.getItem("currentColumn") as string)
const fileType = route.params.fileType as string;
const img = ref({} as HTMLImageElement)     // Composition API to access DOM
const pdf = ref({} as HTMLObjectElement)
// const video = ref({} as HTMLVideoElement)
const video = ref({} as HTMLObjectElement)
onMounted(()=>{
    //   let fontAwesome = document.createElement('script')
    //   fontAwesome.setAttribute('src', '../../public/pdfobject.min.js')
    //   document.head.appendChild(fontAwesome)

    console.log(column, route.params, PDFObject)
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
                PDFObject.embed(objUrl, "#pdfviewer", {height: "40rem"})
                // pdf.value.data = objUrl
            } else if (fileType.includes("video")) {
                video.value.data = objUrl
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
    <object ref="video" :type=fileType
        width='800px' 
        height='600px' />
    <!-- <video controls>
        <source ref="video" :type=fileType>
        Your browser does not support the video tag
    </video> -->
</div>
</template>

<!-- <style>
.pdfobject-container { height: 30rem; border: 1rem solid rgba(0,0,0,.1); }
</style> -->
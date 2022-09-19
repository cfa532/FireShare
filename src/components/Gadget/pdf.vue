<script setup lang="ts">
// import * as pdfobject from 'pdfobject'
import { onMounted, inject, watch, ref } from 'vue';
import { useLeither, useMimei } from '../../stores/lapi';
import ShareVue from './Share.vue';
const api = useLeither()
const mmInfo = useMimei()
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
})
const fileUrl = ref("")
onMounted(() => {
    console.log("PDF mounted", props)
        if (typeof props.filePath !== "undefined") {
            // show files in local /webdav
            fileUrl.value = api.baseUrl+"mf"+"?mmsid="+props.mmfsid
        } else {
            api.client.MFOpenMacFile(api.sid, mmInfo.mid, props.macid, (fsid: string) => {
                // show Mac file in MM database
                fileUrl.value = api.baseUrl+"mf"+"?mmsid="+fsid
            }, (err: Error) => {
                console.error("Open file error=", err)
            })
        }
})
watch(()=>props.filePath, async (cv, pv)=>{
    if (cv !== pv) {
        // something changed if current value != prev value
        console.log(props)
        if (props.fileType?.includes("pdf")) {
            fileUrl.value = api.baseUrl+"mf"+"?mmsid="+props.mmfsid
        }
    }
})
</script>

<template>
    <!-- <div id="pdfviewer" style="width: 100%;"></div> -->
    <ShareVue ref="shareMenu"></ShareVue>
    <object type="application/pdf" :data="fileUrl"  style="width: 100%; height: 95vh;"></object>
</template>
<script setup lang="ts">
// import * as pdfobject from 'pdfobject'
import { onMounted, watch, ref } from 'vue';
import { useLeither, useMimei } from '../../stores/lapi';
const api = useLeither()
const mmInfo = useMimei()
const props = defineProps({
    mid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
})
const fileUrl = ref("")
onMounted(async () => {
    console.log("PDF mounted", props)
    if (typeof props.filePath !== "undefined") {
        // show files in local /webdav
        fileUrl.value = api.baseUrl+"mf"+"?mmsid="+props.mmfsid
    } else {
        if (props.mid?.length === 27)
            return api.baseUrl + "mf?mmsid="+ await api.client.MMOpen(api.sid, props.mid, "last");
        else
            return api.baseUrl + "ipfs?cid="+ props.mid;
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
    <object type="application/pdf" :data="fileUrl"  style="width: 100%; height: 95vh;"></object>
</template>
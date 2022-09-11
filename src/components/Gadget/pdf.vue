<script setup lang="ts">
// import * as pdfobject from 'pdfobject'
import { onMounted, inject, watch, ref } from 'vue';
import { useLeither, useMimei } from '../../stores/lapi';
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
    console.log(props)
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
</script>

<template>
    <!-- <div id="pdfviewer" style="width: 100%;"></div> -->
    <object type="application/pdf" :data="fileUrl"  style="width: 100%; height: 95vh;"></object>
</template>
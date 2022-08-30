<script setup lang="ts">
import * as pdfobject from 'pdfobject'
import { onMounted, inject } from 'vue';
const api: any = inject("lapi");    // Leither api handler
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
})
onMounted(() => {
    if (typeof props.filePath !== "undefined") {
        pdfobject.embed(api.baseUrl + "mf" + props.filePath + "?mmsid="+ props.mmfsid, "#pdfviewer", { height: "60rem" })
        return
    }
    api.client.MFOpenMacFile(api.sid, api.mid, props.macid, (fsid: string) => {
        pdfobject.embed(api.baseUrl + "mf" + "?mmsid="+ fsid, "#pdfviewer", { height: "60rem" })
    }, (err: Error) => {
        console.error("Open file error=", err)
    })
})
</script>

<template>
    <div id="pdfviewer" style="width: 100%;"></div>
</template>
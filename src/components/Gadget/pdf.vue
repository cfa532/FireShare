<script setup lang="ts">
import * as pdfobject from 'pdfobject'
import { onMounted, inject } from 'vue';
const api: any = inject("lapi");    // Leither api handler
const props = defineProps({
    macid : {type: String, required: true},
    fileType: {type: String, required: true}
})
onMounted(() => {
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
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
        api.client.MFGetData(fsid, 0, -1, (buf:  ArrayBuffer) => {
            const blob = new Blob([buf], {type: props.fileType});
            pdfobject.embed(URL.createObjectURL(blob), "#pdfviewer", { height: "60rem" })
        }, (err: Error) => {
            console.error("Get File data error=", err)
        })
    }, (err: Error) => {
        console.error("Open file error=", err)
    })
})
</script>

<template>
    <div style="width: 100%;" id="pdfviewer"></div>
</template>
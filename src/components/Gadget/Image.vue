<script setup lang="ts">
import { onMounted, ref, inject, onUnmounted } from 'vue';
const api: any = inject("lapi");    // Leither api handler
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
})
const imageUrl = ref("")
const img = ref<HTMLImageElement>()
onMounted(async () => {
    imageUrl.value = await getLink()
    // imageUrl.value = api.baseUrl + "mf/" + encodeURI(props.macid!) + "?mmsid="+ api.mmsid
    console.log(props, imageUrl.value)
});
async function getLink():Promise<string> {
    return new Promise((resolve)=>{
        if (typeof props.filePath !== "undefined") {
            // filePath has value, showing a local file
            resolve(api.baseUrl + "mf" + props.filePath + "?mmsid="+ props.mmfsid)
        }
        api.client.MFOpenMacFile(api.sid, api.mid, props.macid, (fsid: string) => {
            resolve(api.baseUrl + "mf" + "?mmsid="+ fsid)
            // api.client.MFGetData(fsid, 0, -1, (buf:  ArrayBuffer) => {
            //     const blob = new Blob([buf], {type: props.fileType});
            //     resolve(URL.createObjectURL(blob))
            // }, (err: Error) => {
            //     console.error("Get File data error=", err)
            // })
        }, (err: Error) => {
            console.error("Open file error=", err)
        })
    })
}
onUnmounted(()=>{
    // URL.revokeObjectURL()
})
</script>

<template>
    <img ref="img" style="max-width: 100%; height: 95vh; object-fit: contain;" :src="imageUrl"/>
</template>
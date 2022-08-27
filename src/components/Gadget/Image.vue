<script setup lang="ts">
import { onMounted, ref, inject } from 'vue';
const api: any = inject("lapi");    // Leither api handler
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false}
})
const imageUrl = ref("")
const img = ref<HTMLImageElement>()
onMounted(async () => {
    console.log(props)
    imageUrl.value = await getLink()
});
async function getLink():Promise<string> {
    return new Promise((resolve)=>{
        api.client.MFOpenMacFile(api.sid, api.mid, props.macid, (fsid: string) => {
            api.client.MFGetData(fsid, 0, -1, (buf:  ArrayBuffer) => {
                const blob = new Blob([buf], {type: props.fileType});
                resolve(URL.createObjectURL(blob))
            }, (err: Error) => {
                console.error("Get File data error=", err)
            })
        }, (err: Error) => {
            console.error("Open file error=", err)
        })
    })
}
</script>

<template>
    <img ref="img" style="max-width: 100%; height: 95vh; object-fit: contain;" :src="imageUrl"/>
</template>
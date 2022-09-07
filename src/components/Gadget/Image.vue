<script setup lang="ts">
import { onMounted, ref, inject, watch } from 'vue';
const api: any = inject("lapi");    // Leither api handler
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
})
console.log(props)
const imageUrl = ref("")
// const img = ref<HTMLImageElement>()
onMounted(async () => {
    imageUrl.value = await getLink()
    // imageUrl.value = api.baseUrl + "mf/" + encodeURI(props.macid!) + "?mmsid="+ api.mmsid
});
async function getLink():Promise<string> {
    return new Promise((resolve)=>{
        if (typeof props.filePath !== "undefined") {
            // filePath not null, showing a local file
            resolve(api.baseUrl + "mf" + props.filePath + "?mmsid="+ props.mmfsid)
        } else {
            api.client.MFOpenMacFile(api.sid, api.mid, props.macid, (fsid: string) => {
                resolve(api.baseUrl + "mf" + "?mmsid="+ fsid)
            }, (err: Error) => {
                console.error("Open file error=", err)
            })
        }
    })
}

watch(()=>props.filePath, async (toParams, prevParams)=>{
    if (toParams as string !== prevParams as string) {
        // getCurrentInstance()?.proxy?.$forceUpdate()
        // router.push(route.fullPath)
        imageUrl.value = await getLink()
    }
})
</script>

<template>
    <img alt="Loading......" style="max-width: 100%; object-fit: contain;" :src="imageUrl"/>
</template>
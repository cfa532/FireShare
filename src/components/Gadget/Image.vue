<script setup lang="ts">
import { computed } from '@vue/reactivity';
import { onMounted, ref, inject, onUnmounted, watch } from 'vue';
const api: any = inject("lapi");    // Leither api handler
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
})
const imageUrl = ref("")
// const img = ref<HTMLImageElement>()
const componentKey = ref(0)
onMounted(async () => {
    imageUrl.value = await getLink()
    // imageUrl.value = api.baseUrl + "mf/" + encodeURI(props.macid!) + "?mmsid="+ api.mmsid
});
async function getLink():Promise<string> {
    return new Promise((resolve)=>{
        if (typeof props.filePath !== "undefined") {
            // filePath not null, showing a local file
            resolve(api.baseUrl + "mf" + props.filePath + "?mmsid="+ props.mmfsid)
        }
        api.client.MFOpenMacFile(api.sid, api.mid, props.macid, (fsid: string) => {
            resolve(api.baseUrl + "mf" + "?mmsid="+ fsid)
        }, (err: Error) => {
            console.error("Open file error=", err)
        })
    })
}
// const imgUrl = computed(async ()=>{
//     return new Promise<string>((resolve)=>{
//         if (typeof props.filePath !== "undefined") {
//             // filePath not null, showing a local file
//             resolve(api.baseUrl + "mf" + props.filePath + "?mmsid="+ props.mmfsid)
//         }
//         api.client.MFOpenMacFile(api.sid, api.mid, props.macid, (fsid: string) => {
//             resolve(api.baseUrl + "mf" + "?mmsid="+ fsid)
//         }, (err: Error) => {
//             console.error("Open file error=", err)
//         })
//     })
// })
watch(()=>props.filePath, async (toParams, prevParams)=>{
    if (toParams as string !== prevParams as string) {
        // getCurrentInstance()?.proxy?.$forceUpdate()
        // router.push(route.fullPath)
        componentKey.value += 1
        imageUrl.value = await getLink()
    }
})
</script>

<template>
    <img :key="componentKey" style="max-width: 100%; height: 95vh; object-fit: contain;" :src="imageUrl"/>
</template>
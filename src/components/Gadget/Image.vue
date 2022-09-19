<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useLeither, useMimei } from '../../stores/lapi';
import ShareVue from './Share.vue';
const api = useLeither();    // Leither api handler
const mmInfo = useMimei()
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
})
const imageUrl = ref("")
onMounted(async () => {
    console.log("Image mounted", props)
    imageUrl.value = await getLink()
    // imageUrl.value = api.baseUrl + "mf/" + encodeURI(props.macid!) + "?mmsid="+ api.mmsid
});
async function getLink():Promise<string> {
    return new Promise((resolve, reject)=>{
        if (typeof props.filePath !== "undefined") {
            // filePath not null, showing a local file
            resolve(api.baseUrl + "mf" + "?mmsid="+ props.mmfsid)
        } else {
            api.client.MFOpenMacFile(api.sid, mmInfo.mid, props.macid, (fsid: string) => {
                resolve(api.baseUrl + "mf" + "?mmsid="+ fsid)
            }, (err: Error) => {
                reject("Open mac file error="+err)
            })
        }
    })
}
watch(()=>props.filePath, async (cv, pv)=>{
    if (cv !== pv) {
        // something changed if current value != prev value
        console.log(props)
        if (props.fileType?.includes("image")) {
            imageUrl.value = await getLink()
        }
    }
})
</script>

<template>
    <ShareVue ref="shareMenu"></ShareVue>
    <img alt="Loading......" style="max-width: 100%; object-fit: contain;" :src="imageUrl"/>
</template>
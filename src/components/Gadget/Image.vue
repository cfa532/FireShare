<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useLeither, useMimei } from '../../stores/lapi';
const api = useLeither();    // Leither api handler
const mmInfo = useMimei()
const props = defineProps({
    mid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
})
const imageUrl = ref("")
onMounted(async () => {
    console.log("Image mounted", props)
    imageUrl.value = await getLink()
});
async function getLink() {
    if (typeof props.filePath !== "undefined") {
        // filePath not null, showing a local file
        return api.baseUrl + "mf?mmsid="+ props.mmfsid
    } else {
        if (props.mid?.length === 27)
            return api.baseUrl + "mf?mmsid="+ await api.client.MMOpen(api.sid, props.mid, "last");
        else
            return api.baseUrl + "ipfs?cid="+ props.mid;
    }
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
    <img alt="Loading......" style="max-width: 100%; object-fit: contain;" :src="imageUrl"/>
</template>
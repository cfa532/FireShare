<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useLeither, useMimei } from '../../stores/lapi';
const api = useLeither();    // Leither api handler
const mmInfo = useMimei();
const props = defineProps({
    mid : {type: String, required: false},      // undefined when showing local files
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
    // title: {type: String, required: true},
    delRef: {type: String, required: false}
})
const imageUrl = ref("")
const showSpinner = ref(true)

const emit = defineEmits(["deleted"])
watch(()=>props.delRef, async nv=>{
    if (nv=="true") {
        // when attached file is deleted, remove its reference from database MM
        await api.client.MMDelRef(api.sid, mmInfo.mid, props.mid);
        emit("deleted")
    }
})

onMounted(async () => {
    // console.log("Image mounted", props)
    await mmInfo.init(api)
    imageUrl.value = await getLink()
    window.setTimeout(async ()=>{
        showSpinner.value = false
    }, 500)
});
async function getLink() {
    if (typeof props.filePath !== "undefined") {
        // filePath not null, showing a local file
        return api.baseUrl + "mf?mmsid="+ props.mmfsid
    } else {
        if (props.mid?.length === 27)
            return api.baseUrl + "mf?mmsid="+ await api.client.MMOpen(api.sid, props.mid, "last");
        else
            return api.baseUrl + "ipfs/"+ props.mid;
    }
}
watch(()=>props.filePath, async (cv, pv)=>{
    if (cv !== pv) {
        // path changed if current value != prev value
        // console.log(props)
        if (props.fileType?.includes("image")) {
            imageUrl.value = await getLink()
        }
    }
})
watch(()=>props.mid, async (cv, pv)=>{
    if (cv !== pv) {
        // path changed if current value != prev value
        // console.log(props)
        if (props.fileType?.includes("image")) {
            imageUrl.value = await getLink()
        }
    }
})
</script>

<template>
    <div v-if="showSpinner" class="spinner-grow" role="status">
        <span class="sr-only">Loading...</span>
    </div>
    <img v-else style="max-width: 100%; object-fit: contain;" :src="imageUrl"/>
</template>
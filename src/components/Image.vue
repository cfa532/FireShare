<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import { useLeither, useMimei } from '../stores/lapi';
const api = useLeither();    // Leither api handler
const mmInfo = useMimei();
const props = defineProps({
    mid : {type: String, required: false},      // undefined when showing local files
    fileType: {type: String, required: true},
    title: {type: String, required: false},
    fileName: {type: String, required: false},
    name: {type: String, required: false},
    index: {type: Number, required: false},
    filePath: {type: String, required: false},
    autoplay: {type: Boolean, required: false},
    mmfsid: {type: String, required: false},    // for displaying local file
    delRef: {type: String, required: false}
})
const imageUrl = ref()
const caption = ref()
const emit = defineEmits(["deleted"])
watch(()=>props.delRef, async nv=>{
    if (nv=="true") {
        // when attached file is deleted, remove its reference from database MM
        await api.client.MMDelRef(api.sid, mmInfo.mid, props.mid);
        emit("deleted")
    }
})
onMounted(async () => {
    console.log("Image mounted", props)
    // await mmInfo.init(api)
    imageUrl.value = await getLink()
});
async function getLink() {
    if (props.filePath)
        caption.value = props.filePath?.substring(props.filePath.lastIndexOf('/')+1)
    else
        caption.value = props.index ? props.index : (props.name || props.fileName)
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
        if (props.fileType?.includes("image")) {
            imageUrl.value = await getLink()
        }
    }
})
</script>

<template>
    <div>
        <img :src="imageUrl"/>
        <p>{{ caption }}</p>
    </div>
</template>

<style>
.container {
    /* text-align: left; */
    margin: 0px;
    padding: 0px;
    /* float: left; */
    display: inline-block;
}
.container img {
    /* position:relative; */
    display: block;
    max-width: 100%;
    width: 100%;
    height: auto;
}
.container p {
    /* display: block; */
    text-align: center;
    position: relative;
    margin-top: 5px; 
    margin-bottom: 10px; 
    font-size: small; 
    color:darkslategray; 
}
</style>
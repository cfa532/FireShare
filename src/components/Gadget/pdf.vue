<script setup lang="ts">
// import * as pdfobject from 'pdfobject'
import { onMounted, watch, ref } from 'vue';
import { useLeither, useMimei } from '../../stores/lapi';
const api = useLeither()
const mmInfo = useMimei()
const props = defineProps({
    mid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
    delRef: {type: String, required: false}
})
const fileUrl = ref("")
const emit = defineEmits(["deleted"])
watch(()=>props.delRef, async nv=>{
    if (nv=="true") {
        // when attached file is deleted, remove its reference from database MM
        await api.client.MMDelRef(api.sid, mmInfo.mid, props.mid);
        emit("deleted")
    }
})

onMounted(async () => {
    console.log("PDF mounted", props)
    await mmInfo.init(api)
    if (typeof props.filePath !== "undefined") {
        // show files in local /webdav
        fileUrl.value = api.baseUrl+"mf?mmsid="+props.mmfsid
    } else {
        if (props.mid?.length === 27) {
            // window.open(api.baseUrl + "mf?mmsid="+ await api.client.MMOpen(api.sid, props.mid, "last"), "_blank")
            // history.go(-1)
            fileUrl.value = api.baseUrl + "mf?mmsid="+ await api.client.MMOpen(api.sid, props.mid, "last")
        } else
            fileUrl.value = api.baseUrl + "ipfs/"+ props.mid;
    }
})
watch(()=>props.filePath, (cv, pv)=>{
    if (cv !== pv) {
        // something changed if current value != prev value
        if (props.fileType?.includes("pdf")) {
            fileUrl.value = api.baseUrl+"mf"+"?mmsid="+props.mmfsid
        }
    }
})
watch(()=>props.mid, async (cv, pv)=>{
    if (cv !== pv) {
        if (props.mid?.length === 27) {
            fileUrl.value = api.baseUrl + "mf?mmsid="+ await api.client.MMOpen(api.sid, props.mid, "last")
        } else
            fileUrl.value = api.baseUrl + "ipfs/"+ props.mid;
    }
})
</script>

<template>
    <object type="application/pdf" :data="fileUrl"  style="min-height:100vh;width:100%"></object>
</template>
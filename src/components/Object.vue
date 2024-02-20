<script setup lang="ts">
import { onMounted, inject, watch, ref } from 'vue';
const api: any = inject("lapi");    // Leither api handler
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
})
const objUrl = ref("")
onMounted(() => {
    if (typeof props.filePath !== "undefined") {
        objUrl.value = (api.baseUrl+"mf"+props.filePath+"?mmsid="+props.mmfsid)
        console.log("Download", objUrl.value)
        api.client.MFGetData(props.mmfsid, 0, -1, (fileData:Uint8Array)=>{
            downLoadByFileData(fileData, props.filePath, props.fileType)
        })
    }
})

function downLoadByFileData(content:Uint8Array, fileName:string|undefined, mimeType:string|undefined) {    
    var blob = new Blob([content], {type: mimeType});    
    //console.log("blob.type", blob.type);
    var a = document.createElement("a");
    a.href = window.URL.createObjectURL(blob);    
    a.download = fileName as string;
    a.type =  mimeType as string;
    a.click();
    window.URL.revokeObjectURL(a.href);
}
</script>

<template>
    <div id="objViewer" style="width: 100%;">
        <!-- <object data="objUrl"></object> -->
    </div>
</template>
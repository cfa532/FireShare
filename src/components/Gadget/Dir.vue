<script setup lang="ts">
import { inject, ref, onMounted, watch, computed } from "vue";

const api: any = inject("lapi");    // Leither api handler
const localFiles = ref<any[]>();
const props = defineProps({
    filePath: {type: String, required: true},
})
const parentPath = computed(()=>{
    const idx = props.filePath?.lastIndexOf('/')
    console.log("idx=", idx, props.filePath)
    if (typeof idx==="undefined" || idx! <= 0) {
        return '/'
    } else {
        return props.filePath?.substring(0, props.filePath.lastIndexOf('/'))
    }
});
const filePath = computed(()=>{
    return props.filePath==='/' ? '/' : props.filePath+'/';
})

onMounted(()=>{
    console.log("Reading dir:", (props.filePath))
    showDir(props.filePath)
})
watch(()=>props.filePath, (toParams, prevParams)=>{
    if (toParams as string !== prevParams as string) {
        showDir(props.filePath)
    }
})
function showDir(filePath: string) {
    api.client.MFOpenByPath(api.sid, "mmroot", filePath, 0, (mmfsid:string)=>{
        api.client.MFReaddir(mmfsid, (files:any[])=>{
            localFiles.value = files
        })
    }, (err:Error)=>{
        console.error("Open path err=", err)
    })
}
function fileDownload(e: MouseEvent, f: any){
    api.client.MFOpenByPath(api.sid, "mmroot", filePath.value+f.fName, 0, (mmfsid:string)=>{
        // var a = e.target as HTMLAnchorElement
        // var a = document.createElement("a");
        // a.href = api.baseUrl + "mf" + filePath.value + "?mmsid="+ mmfsid
        // a.download = f.fName;
        // a.type =  mimeType;
        // console.log(a)
        // a.click();
        api.client.MFGetData(mmfsid, 0, -1, (fileData:Uint8Array)=>{
            api.downLoadByFileData(fileData, f.fName, "")
        })
    })
}
</script>

<template>
<div>
    <ul style="padding: 0px; margin: 0 0 0 5px;">
    <li v-if="props.filePath!==parentPath" class="fileList">
        <RouterLink :to="{name:'fileview2', params:{filePath: parentPath}}" style="font-weight: bold;">. .</RouterLink>
    </li>
    <li class="fileList" v-for="(file, index) in localFiles" :key="index">
        <RouterLink
            :to="{ name:'fileview2', params:{filePath: (filePath+file.fName)}}">{{file.fName}}
        </RouterLink>
        <span v-if="file.fIsDir"> ...&gt;</span>
        <span>&nbsp;&nbsp;&nbsp;&nbsp;</span>
        <span v-if="['pdf', 'doc'].includes(file.fName.substring(file.fName.length-3).toLowerCase())">
            <a href="" @click.prevent="(e)=>fileDownload(e, file)" download>&dArr;</a>
        </span>
    </li>
    </ul>
</div>
</template>
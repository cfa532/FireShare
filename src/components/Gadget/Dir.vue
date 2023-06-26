<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useLeither, useMimei, useSpinner } from "../../stores/lapi";
import Pager from "./Pager.vue"
const api = useLeither();
const mmInfo = useMimei();
const localFiles = ref<any[]>();
const currentPage = ref(1)
const pageSize  = ref(30)       // number of items displayed per page
const itemNumber = ref(1)
const props = defineProps({
    filePath: {type: String, required: true},
})
const parentPath = computed(()=>{
    const idx = props.filePath?.lastIndexOf('/')
    if (typeof idx==="undefined" || idx! <= 0) {
        return '/'
    } else {
        return props.filePath?.substring(0, props.filePath.lastIndexOf('/'))
    }
});
const filePath = computed(()=>{
    return props.filePath==='/' ? '/' : props.filePath+'/';
})

onMounted(async ()=>{
    console.log("Dir mounted:", props)
    await showDir(props.filePath)
    useSpinner().setLoadingState(false)
})
watch(()=>props.filePath, (toParams, prevParams)=>{
    if (toParams as string !== prevParams as string) {
        // console.log(toParams, prevParams)
        currentPage.value = 1       // to reload dir data when <- or .. is clicked
        showDir(props.filePath)
    }
})
function pageChanged(n: number) {
    currentPage.value = n
    showDir(props.filePath)
}
async function showDir(filePath: string) {
    const files = [
        {fName: "Burnt 2015.mp4", template:"ipfs", id: "QmP8i1tEnV8WwCmUbzpkkT1epJFiNaZiuiGR6kNKqhfgLf"},
        {fName: "Matrix 1999.mp4", template:"tpt", id: "dJM6X7OTmJXbGqPQaFdAZ3kGpBl"},
    ];
    try {
        itemNumber.value = files.length
        var st = (currentPage.value - 1) * pageSize.value
        localFiles.value = files.slice(st, st + pageSize.value)
    } catch(err) {
        console.error("showMMDir err=", err)
    }
}
function showVideo(file: any) {
    console.log(file);
    let objUrl = api.baseUrl + file.template + "/" + file.id
    if (file.template == "tpt") {
        window.open(objUrl, '_blank');
    } else {
        let strVideo = '<video controls autoplay style="width:100%" id= "media" name="media"><source src="' + objUrl+ '" type="video/mp4"> </video>'
        document.getElementById('dirBody')!.innerHTML = strVideo
    }
    // history.pushState({key: Date.now()}, "", location.href)
}
function fileDownload(e: MouseEvent, file: any){
    api.client.MFOpenByPath(api.sid, "mmroot", filePath.value+file.fName, 0, (mmfsid:string)=>{
        api.client.MFGetData(mmfsid, 0, -1, (fileData:Uint8Array)=>{
            mmInfo.downLoadByFileData(fileData, file.fName, "")
        }, (err:Error)=>{
            console.error("MFGetData err=", err)
        })
    }, (err:Error)=>{
        console.error("Open by path err=", err)
    })
}
</script>

<template>
<div id="dirBody">
    <ul style="padding: 0px; margin: 0 0 0 5px;">
    <li v-if="props.filePath!==parentPath" class="fileList">
        <RouterLink :to="{name:'fileview2', params:{filePath:parentPath}}"><strong>. .</strong></RouterLink>
    </li>
    <li class="fileList" v-for="(file, index) in localFiles" :key="index">
        <a v-if="['docx', 'doc'].includes(file.fName.substring(file.fName.length-3).toLowerCase())"
            href="#" @click.prevent="(e)=>fileDownload(e, file)" download>{{file.fName}} &dArr;
        </a>
        <RouterLink v-else
            :to="{ name:'fileview3', params:{tpt:file.template, id:file.id}}">{{file.fName}}
        </RouterLink>
        <span v-if="file.fIsDir"> ...&gt;</span>
    </li>
    </ul>
    <Pager v-if="itemNumber/pageSize>1" @page-changed="pageChanged"
        :current-page="currentPage" :page-size="pageSize" :item-number="itemNumber"></Pager>
</div>
</template>
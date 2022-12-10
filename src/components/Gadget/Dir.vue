<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useLeither, useMimei } from "../../stores/lapi";
import Pager from "./Pager.vue"
const api = useLeither();
const mmInfo = useMimei();
const localFiles = ref<any[]>();
const currentPage = ref(1)
const pageSize  = ref(20)
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

onMounted(()=>{
    console.log("Dir mounted:", props)
    showDir(props.filePath)
    self.addEventListener('pageChanged', (e:any)=>{
        // console.log("current page changed to", e.detail)
        currentPage.value = e.detail.page
        showDir(props.filePath)
    })
})
watch(()=>props.filePath, (toParams, prevParams)=>{
    if (toParams as string !== prevParams as string) {
        // console.log(toParams, prevParams)
        // currentPage.value = 1       // to reload dir data when backWard key is clicked
        showDir(props.filePath)
    }
})
function showDir(filePath: string) {
    api.client.MFOpenByPath(api.sid, "mmroot", filePath, 0, (mmfsid: string) => {
        api.client.MFReaddir(mmfsid, (files: any[]) => {
            itemNumber.value = files.length
            var st = (currentPage.value - 1) * pageSize.value
            console.log("total items=", itemNumber.value, st, pageSize.value)
            localFiles.value = files.slice(st, st + pageSize.value)
        }, (err: Error) => {
            console.error("Readdir err=", err)
        })
    }, (err: Error) => {
        console.error("Open path err=", err)
    })
}
async function showMMDir(mmPath: string) {
    try {
        let mmsid = await api.client.MMOpenUrl();
        let files = api.client.MFReaddir(mmsid);
        itemNumber.value = files.length
        var st = (currentPage.value - 1) * pageSize.value
        localFiles.value = files.slice(st, st + pageSize.value)
    } catch(err) {
        console.error("showMMDir err=", err)
    }
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
<div>
    <ul style="padding: 0px; margin: 0 0 0 5px;">
    <li v-if="props.filePath!==parentPath" class="fileList">
        <RouterLink :to="{name:'fileview2', params:{filePath:parentPath}}"><strong>. .</strong></RouterLink>
    </li>
    <li class="fileList" v-for="(file, index) in localFiles" :key="index">
        <a v-if="['docx', 'doc'].includes(file.fName.substring(file.fName.length-3).toLowerCase())"
            href="" @click.prevent="(e)=>fileDownload(e, file)" download>{{file.fName}} &dArr;
        </a>
        <RouterLink v-else
            :to="{ name:'fileview2', params:{filePath:filePath+file.fName}}">{{file.fName}}
        </RouterLink>
        <span v-if="file.fIsDir"> ...&gt;</span>
    </li>
    </ul>
    <Pager v-if="itemNumber/pageSize>1" 
        :current-page="currentPage" :page-size="pageSize" :item-number="itemNumber"></Pager>
</div>
</template>
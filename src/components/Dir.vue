<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useLeither, useMimei, useSpinner } from "../stores/lapi";
import { Pager, Spinner } from "./index"
import { useRouter } from "vue-router";
const router = useRouter()
const api = useLeither();
const mmInfo = useMimei();
const currentFiles = ref<any[]>();
const files = ref<any[]>()
const currentPage = ref(1)
const pageSize  = ref(20)       // number of items displayed per page
const itemNumber = ref(1)
const props = defineProps({
    filePath: {type: String, required: true},
    mmfsid: {type: String, required: false},
    fileType: {type: String, required: false},
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
    await showDir(filePath.value)
})
watch(filePath, (toParams, prevParams)=>{
    if (toParams as string !== prevParams as string) {
        // console.log(toParams, prevParams)
        currentPage.value = 1       // to reload dir data when <- or .. is clicked
        showDir(filePath.value)
    }
})
function pageChanged(n: number) {
    currentPage.value = n
    showDir(filePath.value)
}
async function showDir(filePath: string) {
    try {
        if (!api.sid) {
            useSpinner().setLoadingState(false)
            return        // only show local files to login user
        }
        useSpinner().setLoadingState(true)
        let mmfsid = await api.client.MFOpenByPath(api.sid, "mmroot", filePath, 0);
        let fi = await api.client.MFStat(mmfsid);
        if (fi.fIsDir) {
            files.value = (await api.client.MFReaddir(mmfsid)).filter((f:any)=>{return f.fName.substring(0,1) !== '.'})    // remove hidden dot files
            // sort according to file name
            files.value!.sort((a, b)=> a.fName < b.fName ? -1 : 1)
            sessionStorage["localFiles"] = JSON.stringify({files:files.value})
            itemNumber.value = files.value!.length
            var st = (currentPage.value - 1) * pageSize.value
            console.log("total items=", itemNumber.value, st, pageSize.value)
            currentFiles.value = files.value!.slice(st, st + pageSize.value)
        }
        useSpinner().setLoadingState(false)
    } catch(err) {
        console.error("showMMDir err=", err)
    }
}
function fileDownload(e: MouseEvent, file: any) {
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
function fmtSize(s: number) {
    if (s >= 1000000000) {
        return Math.round(s/1000000000) + 'G'
    } else if (s >= 1000000) {
        return Math.round(s/1000000) + 'M'
    } else if (s >= 1000) {
        return Math.round(s/1000) + 'K'
    }
    return s
}
function showFile(path:string, index:number) {
    sessionStorage["localFiles"] = JSON.stringify({files:files.value, index:pageSize.value*(currentPage.value-1) + index})
    router.push({name: "fileview2", params: {filePath: path}})
}
</script>

<template>
<Spinner :active="useSpinner().loading" text="Please wait......"/>
<div id="dirBody" style="margin: 0px; padding: 0px;">
    <ul class="aList">
        <!-- show .. if there is a parent dir -->
        <div style="margin-bottom: 5px;" v-if="filePath!==parentPath">
            <RouterLink :to="{name:'fileview2', params:{filePath: parentPath}}"><strong><b>. .</b></strong></RouterLink>
        </div>
        <li class="aList" v-for="(file, index) in currentFiles" :key="index">
          <span style="max-width: 88%; word-wrap: break-word; display: inline-block;">
            <a v-if="['docx', 'doc'].includes(file.fName.substring(file.fName.length-4).toLowerCase())"
                href="#" @click.prevent="(e:MouseEvent)=>fileDownload(e, file)" download>{{file.fName}} &dArr;</a>
            <a v-else @click="showFile(filePath+file.fName, index)">{{file.fIsDir? file.fName+" ...>": file.fName}}</a>
          </span>
          <span v-if="!file.fIsDir" style="position: absolute; right: 0; font-size: smaller;">{{ fmtSize(file.fSize) }}&nbsp;&nbsp;&nbsp;</span>
        </li>
    </ul>
    <Pager v-if="itemNumber/pageSize>1" @page-changed="pageChanged"
        :current-page="currentPage" :page-size="pageSize" :item-number="itemNumber"></Pager>
</div>
</template>

<style>
ul.aList {
  list-style-type: none;
  overflow: hidden;
  /* margin: 0px 0px 0px -20px; */
  width: 99%;
  padding-left: 10px;
}
ul.aList li::marker {
    color: gray;
    /* list-style-position: outside; */
}
ul.aList li {
  padding: 5px 0px 0px 0px;
}
ul.aList li:hover {
  background-color: cornsilk;
}
ul.aList li:nth-child(even) {
  background: rgb(220, 247, 202, 0.5);
}
ul.aList li a {
    display: block;     /* make the Li row clickable */
}
</style>
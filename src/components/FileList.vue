<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useLeither, useMimei, useSpinner } from '../stores/lapi';
import { useRoute, useRouter } from "vue-router";
import MyDir from './Gadget/Dir.vue';
import Pager from "./Gadget/Pager.vue";
import EditorModal from "./EditorModal.vue";
import Spinner from "./Gadget/Spinner.vue";
// import { defineAsyncComponent } from 'vue'
// const EditorModal = defineAsyncComponent(()=>import("./EditorModal.vue"));
const api = useLeither()
const mmInfo = useMimei()
const route = useRoute()
const router = useRouter()
const fileList = ref<FileInfo[]>([])
const pageSize = ref(20)
const itemNumber = ref(1)
const showEditor =  ref("none")
const currentPage = computed(() => route.params.page? parseInt(route.params.page as string) : 1)
const localRoot = '/'
const columnTitle = computed(() => route.params.title as string)

onMounted(async ()=>{
    await mmInfo.init(api)
    console.log("FileList mounted:", route.params)
    if (columnTitle.value !== "Webdav") {
        document.title = import.meta.env.VITE_PAGE_TITLE+' - '+columnTitle.value
        api.client.Zcount(await mmInfo.mmsid, route.params.title, 0, Date.now(), async (count: number)=>{     // -1 does not work for stop
            itemNumber.value = count;    // total num of items in the list as a Mimei
            await getFileList(currentPage.value);
            useSpinner().setLoadingState(false)
        }, (err: Error) => {
            console.error("Zcount error=", err)
        })
    }
})

function uploaded(fi: FileInfo) {
    fileList.value.unshift(fi)
    itemNumber.value += 1;
    showEditor.value = "none"
    // route.params.page = "1"
    // router.go(0);
}
function fileDownload(e: MouseEvent, file: any){
    api.client.MMOpen(api.sid, file.mid, "last", (fsid: string)=> {
        api.client.MFGetData(fsid, 0, -1, (fileData:Uint8Array)=>{
            mmInfo.downLoadByFileData(fileData, file.name, "")
        }, (err: Error) => {
            console.error("Getdata error=", err)
        })
    }, (err: Error) => {
        console.error("Open file error=", err)
    })
}
function pageChanged(n: number) {
    getFileList(n)
    router.push({name: "filelist", params: {page: n}})
}
function fileName(file: FileInfo) {
    // console.log(file)
    if (file.caption) return file.caption;
    // if (file.type.includes("page")) {
    //     // show first 30 chars if the list item is a page
    //     const title = JSON.parse(file.name)[0]
    //     if (title.trim()==="") {
    //         return "Page without text"
    //     }
    //     return JSON.parse(file.name)[0].substring(0, 30)
    // }
    return file.name;
}
async function getFileList(pn: number) {
    // get mm file list on current page, page number start at 1
    let start = (pn - 1) * pageSize.value
    console.log(route.params, start)
    api.client.Zrevrange(await mmInfo.mmsid, route.params.title, start, start+pageSize.value-1, async (sps:ScorePair[])=>{
        fileList.value.length = 0       // clear fileList array
        // console.log(sps)
        let mbs = sps.map((sp:ScorePair)=> sp.member)   // Mimei ids on the current page
        api.client.Hmget(await mmInfo.mmsid, route.params.title, ...mbs, (fis: FileInfo[]) => {
            fis.forEach((fi, idx)=>{
                if (!fi || !fi.type || fi.size==0) {
                    console.warn("FileInfo Error", sps[idx], fi)
                    return
                }
                fi.mid = sps[idx].member
                // temporarily use timestamp when the file is added to the SocrePairs, for sorting
                fi.lastModified = sps[idx].score;
                fileList.value.push(fi)
                // console.log(fi)
            })
            // fileList.value.sort((a: FileInfo, b: FileInfo) => a.lastModified > b.lastModified ? -1 : 1)
        }, (err: Error) => {
            console.error("Hget error=", err)
        })
    }, (err: Error) => {
        console.error("Zrevrange error=", err)
    })
}
// watch(currentPage, (oldVal, newVal)=>{
//     console.log(oldVal, newVal, route.params.page)
//     if (newVal===0 || typeof newVal==="undefined") getFileList(1)
// })
</script>

<template>
    <!-- <NaviBar :column="(columnTitle as string)"></NaviBar> -->
    <Spinner :active="useSpinner().loading" text="Please wait......"/>
    <!-- <hr/> -->
    <div v-if="columnTitle !== 'Webdav'">
        <div v-show="api.sid">
            <div class="postbox">
                <p @click="showEditor='block'" class="postbox">Tell us what is happening....</p>
            </div>
            <EditorModal v-if="api.sid" @uploaded="uploaded" @hide="showEditor='none'" :display="showEditor"
                :column="columnTitle"></EditorModal>
        </div>
        <ul class="aList">
            <li v-for="(file, index) in fileList" :key="index">
                <RouterLink v-if="file.type.includes('image') || file.type.includes('video') || file.type.includes('audio')
                || file.type.includes('page') || file.type.includes('pdf')"
                    :to="{ name: 'fileview', params: { title: columnTitle, mid: file.mid, fileType: file.type, fileName: fileName(file)} }">
                    {{ fileName(file) }}
                </RouterLink>
                <a v-else href="" @click.prevent="(e:MouseEvent) => fileDownload(e, file)" download>{{ file.name }} &dArr;
                </a>
            </li>
        </ul>
        <Pager v-if="itemNumber/pageSize>1" @page-changed="pageChanged" :current-page="currentPage"
            :page-size="pageSize" :item-number="itemNumber"></Pager>
    </div>
    <div v-else>
        <MyDir :filePath="localRoot"></MyDir>
    </div>
</template>

<style>
ul.aList {
  list-style-type: decimal;
  overflow: hidden;
  /* margin: 0px 0px 0px -20px; */
  width: 95%;
  padding-left: 30px;
}
ul.aList li {
  padding: 5px 0px 0px 0px;
}
ul.aList li:hover {
  background-color: cornsilk;
}
ul.aList li:nth-child(even) {
  background: rgb(220, 247, 202, 0.5);;
}

p.postbox {
  font-style: italic;
  opacity: 0.3;
  margin: 10px 0px 0px 20px;
  width: 100%;
}
p.postbox:hover {
  opacity: 0.6;
}
div.postbox {
  display: flex;
  background-color:#f9f9f9;
  width: 100%;
  max-width: 600px;
  height: 40px;
  margin: 0px 0px 10px 0px;
  box-shadow: 0px 2px 2px 0px rgba(0,0,0,0.2);
  cursor: text;
}
</style>
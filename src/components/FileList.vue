<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { useLeither, useMimei } from '../stores/lapi';
import { useRoute, useRouter } from "vue-router";
import MyDir from './Gadget/Dir.vue';
import Pager from "./Gadget/Pager.vue";
import EditorModal from "./EditorModal.vue";
import NaviBar from "./NaviBar.vue";
const api = useLeither()
const mmInfo = useMimei()

const route = useRoute()
const router = useRouter()
const fileList = ref<FVPair[]>([])
const pageSize = ref(20)
const itemNumber = ref(1)
const showEditor =  ref("none")
const currentPage = computed(() => route.params.page? parseInt(route.params.page as string) : 1)
const localRoot = '/'
const columnTitle = computed(() => route.params.title)

onMounted(async ()=>{
    await mmInfo.init(api)
    console.log("FileList mounted:", route.params)
    if (route.params.title !== "Webdav") {
        api.client.Zcount(mmInfo.mmsid, route.params.title, 0, Date.now(), (count: number)=>{     // -1 does not work for stop
            itemNumber.value = count;    // total num of items in the list as a Mimei
            getFileList();
        }, (err: Error) => {
            console.error("Zcount error=", err)
        })
    }
})

function uploaded(fi: FVPair) {
    fileList.value.unshift(fi)
    itemNumber.value += 1;
    showEditor.value = "none"
}
function showModal(e: MouseEvent) {
    // show modal box
    showEditor.value = "block"
}
function hide() {
    showEditor.value = "none"
}
function fileDownload(e: MouseEvent, file: any){
    api.client.MFOpenMacFile(api.sid, mmInfo.mid, file.macid, (fsid: string) => {
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
    router.push({name: "filelist", params: {page: n}})
}
function fileName(file: FVPair) {
    if (file.type.includes("page")) {
        // show first 30 chars if the list item is a page
        const title = JSON.parse(file.name)[0]
        if (title.trim()==="") {
            return "Page without text"
        }
        return JSON.parse(file.name)[0].substring(0, 30)
    }
    return file.name
}
async function getFileList() {
    // get mm file list on current page
    let start = (currentPage.value - 1) * pageSize.value
    console.log(mmInfo.$state, route.params, start)
    api.client.Zrevrange(await mmInfo.mmsid, route.params.title, start, start + pageSize.value, (sps:[])=>{
        fileList.value.length = 0
        console.log(sps)
        sps.forEach(async (element: ScorePair) => {
            api.client.Hget(await mmInfo.mmsid, route.params.title, element.member, (fi: FVPair) => {
                if (!fi) {
                    console.warn("mac file without info", element)
                    return
                }
                fi.macid = element.member
                // temporarily use timestamp when the file is added to the SocrePairs, for sorting
                fi.lastModified = element.score;
                fileList.value.push(fi)
                fileList.value.sort((a: FVPair, b: FVPair) => a.lastModified > b.lastModified ? -1 : 1)
            }, (err: Error) => {
                console.error("Hget error=", err, element)
            })
        });
    }, (err: Error) => {
        console.error("Zrevrange error=", err)
    })
}
watch(currentPage, (newVal)=>{
    getFileList()
})
</script>

<template>
<NaviBar :column="columnTitle"></NaviBar>
    <hr/>
<div v-if="columnTitle !== 'Webdav'">
    <div class="postbox">
        <p @click="showModal" class="postbox">Tell us what is happening....</p>
    </div>
    <EditorModal @uploaded="uploaded" @hide="hide" :display="showEditor" :column="columnTitle"></EditorModal>
    <ul style="padding: 0px; margin: 0 0 0 5px;">
    <li class="fileList" v-for="(file, index) in fileList" :key="index">
        <RouterLink v-if="file.type.includes('image') || file.type.includes('video') 
                    || file.type.includes('page') || file.type.includes('pdf')"
            :to="{ name:'fileview', params:{title:columnTitle, macid:file.macid, fileType:file.type}}">{{fileName(file)}}
        </RouterLink>
        <a v-else
            href="" @click.prevent="(e)=>fileDownload(e, file)" download>{{file.name}} &dArr;
        </a>
    </li>
    </ul>
    <Pager v-if="itemNumber/pageSize>1" @page-changed="pageChanged"
        :current-page="currentPage" :page-size="pageSize" :item-number="itemNumber"></Pager>
</div>
<div v-else>
    <MyDir :filePath="localRoot"></MyDir>
</div>
</template>


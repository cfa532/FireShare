<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Column } from "../components/index";
import { useMimei, useLeither } from "../stores/lapi"
import Spinner from '../components/BootSpinner.vue';

const api = useLeither();
const mmInfo = useMimei();
const contentColumn = ref<ContentColumn[]>([])
const columnTitle = ref('News')
const fileList = ref<FileInfo[]>([])
const pageSize = ref(50)
const checkedItems = ref<FileInfo[]>([])
const mid = ref()
const loading = ref(false)

onMounted(async ()=>{
    contentColumn.value = mmInfo.naviColumnTree
    await getFileList(0);
})
function fileName(file: FileInfo):string {
    return file.caption? file.caption : file.name;
}
async function getFileList(pn: number) {
    const sps = await api.client.Zrevrange(await mmInfo.mmsid, columnTitle.value, 0, pageSize.value-1)
    fileList.value.length = 0       // clear fileList array
    // member list
    let mbs = sps.map((sp:ScorePair)=> sp.member)   // Mimei ids on the current page
    const fis = await api.client.Hmget(await mmInfo.mmsid, columnTitle.value, ...mbs)
    fis.forEach(async (fi:FileInfo, idx:number)=>{
        if (!fi || !fi.type || fi.size==0) {
            console.warn("FileInfo Error. idx=", mbs[idx], fi)
            return
        }
        fi.mid = sps[idx].member
        // temporarily use timestamp when the file is added to the SocrePairs, for sorting
        fi.lastModified = sps[idx].score;
        fileList.value.push(fi)
    })
    // update session every time updating file list
    sessionStorage["fileList"] = JSON.stringify({"posts":fileList.value, "pageSize":pageSize.value, "pageNumber":pn})
}
async function delPosts() {
    const members = checkedItems.value.map(e=>e.mid)
    if (mid.value) members.push(mid.value)
    console.log(members)
    loading.value = true
    await mmInfo.delPosts(columnTitle.value, members)
    checkedItems.value.length = 0
    fileList.value.length = 0
    mid.value = ""
    getFileList(0)
    loading.value = false
}
</script>

<template>
    <!-- <NaviBar :column="(columnTitle as string)"></NaviBar> -->
    <div class='container-fluid'>
        <div class='row'>
            <div class='col-2'>
                <Column @selected-column="id =>{columnTitle=id; getFileList(0)}" v-for='(c, i) in contentColumn' :key='i' :column=c>
                </Column>
            </div>
            <div class='col-10'>
            <form @submit.prevent="delPosts()">
                <div class="row align-items-center">
                    <div class='col-8'>
                        <label>{{mmInfo.getColumn(columnTitle)?.titleZh}}:</label>&nbsp;
                        <input type="text" v-model="mid" maxlength="64" size="40" class="mr-2" />&nbsp;
                        <input type="submit" value="Delete" />
                    </div>
                </div>
                <div class='row'>
                    <ul class="aList">
                        <li v-for="(file, index) in fileList" :key="index">
                            <input type="checkbox" :value="file" v-model="checkedItems">&nbsp;{{fileName(file)}}
                        </li>
                    </ul>
                </div>
                <Spinner :visible="loading" />
            </form>
            </div>
        </div>
    </div>
</template>

<style>
.container-fluid {
  margin-top: 10px;
  height: 100vh;
  /* Ensure the container takes the full height of the viewport */
}
.row {
  display: flex;
  align-items: flex-start;
  /* Align items to the top */
  height: 100%;
  /* Ensure the row takes the full height of the container */
}
.col-2 {
  width: 160px;
}
.col-10 {
  margin: -0px 0 0 0;
  /* Remove any margin that might affect alignment */
  width: 80%;
  padding: 0;
  /* Remove any padding that might affect alignment */
  display: flex;
  flex-direction: column;
  /* Ensure the content inside col-10 is aligned to the top */
}
</style>
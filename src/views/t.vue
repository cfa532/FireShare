<script setup lang="ts">
import { onMounted, ref, watch, shallowRef } from 'vue'
import { useRoute } from 'vue-router';
import { useLeither, useMimei, useSpinner } from '../stores/lapi';
import { Html as Page, Image, VideoJS, EditorModal, PDFView, Spinner } from '../components/index'

const api = useLeither()
const mmInfo = useMimei()
const route = useRoute()
const showEditor =  ref("none")
const columnTitle = ref("t")    // special column for upload temp files
const mid = route.params.id     // if none, show upload button. If valid id, display the file page.
const fileView = ref<HTMLDivElement>()
const userComponent = shallowRef()
const params = ref()

onMounted(async () => {
    if (!sessionStorage["isBot"] && mid) {
        confirm("如果在微信中转发，请点击右上角的\u2022\u2022\u2022") ? sessionStorage["isBot"] = "No" : history.go(-1)
    }
    useSpinner().setLoadingState(false)
    if (mid) {
        const fileInfo :FileInfo = await api.client.Hget(await mmInfo.mmsid, columnTitle.value, mid)
        if (!["image", "pdf", "video", "audio", "page"].some(s => fileInfo.type.includes(s))) {
            //download it
            const fsid = await api.client.MMOpen(api.sid, mid, "last")
            const fileData = await api.client.MFGetData(fsid, 0, -1)
            mmInfo.downLoadByFileData(fileData, fileInfo.name, "")
        }
        load(fileInfo)
    }
})
function fileName(file: FileInfo):string {
    return file.caption? file.caption : file.name;
}
async function load(fi:FileInfo) {
    document.title = fileName(fi) +' - '+import.meta.env.VITE_PAGE_TITLE
    
    // display file content or download it.
    if (fi.type.includes("image")) {
        fileView.value!.hidden = false
        userComponent.value = Image
    } else if (fi.type.includes("pdf")) {
        fileView.value!.hidden = false
        userComponent.value = PDFView
    } else if (fi.type.includes("video") || fi.type.includes("audio")) {
        fileView.value!.hidden = false
        userComponent.value = VideoJS
    } else if (fi.type.includes("page")) {
        // webpage that includes text and files
        fileView.value!.hidden = false
        userComponent.value = Page
    } else {
        const fsid = await api.client.MMOpen(api.sid, mid, "last")
        const fileData = await api.client.MFGetData(fsid, 0, -1)
        mmInfo.downLoadByFileData(fileData, fi.name, "")
        console.warn("Downlaoded", fi)
    }
    params.value = { title: columnTitle.value, mid: fi.mid, fileType: fi.type, fileName: fileName(fi)}
}

const tlink = ref()
function uploaded(fi: FileInfo) {
    // a file is uploaded, display it link
    console.log(window.location)
    const url = window.location.href
    tlink.value = url.substring(0, url.indexOf('/t'))+"/t/"+fi.mid

    // save it to clipboard, http way
    var input = document.body.appendChild(document.createElement("input"));
    input.value = tlink.value;
    input.focus();
    input.select();
    document.execCommand('copy');
    input.parentNode!.removeChild(input);

    showEditor.value = "none"
    api.logout()
}
async function upload() {
    showEditor.value = "block"
    await api.login("lsb2", "123456")
}
watch(()=>route.params.id, async (nv)=>{
    if (nv) load(await api.client.Hget(await mmInfo.mmsid, columnTitle.value, route.params.id))
})

</script>
<template>
    <Spinner :active="useSpinner().loading" text="Please wait......"/>
    <div ref="fileView" hidden>
        <component :is="userComponent" v-bind="params"></component>
    </div>
    <hr>
    <button class="btn btn-link" @click.prevent="upload">Upload</button>
    <br>
    <a style="text-decoration: underline;" :href="tlink">{{ tlink }}</a>

    <EditorModal @uploaded="uploaded" @hide="showEditor='none'" :display="showEditor"
                :column="columnTitle"></EditorModal>
</template>
<style>
.msg {
    position: "absolute";
    z-index: 9999;
    background-color: rgb(242, 246, 217);
    height: 40px;
    width: 300px;
    border-radius: 10px;
}
</style>
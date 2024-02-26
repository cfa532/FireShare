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
const props = ref()

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
    props.value = { title: columnTitle.value, mid: fi.mid, fileType: fi.type, fileName: fileName(fi)}
}

const tlink = ref()
function uploaded(fi: FileInfo) {
    // a file is uploaded, display it link
    console.log(window.location)
    const url = window.location.href
    tlink.value = url.substring(0, url.indexOf('/t'))+"/t/"+fi.mid
    copyLink()
    window.location.href = tlink.value
    showEditor.value = "none"
    api.logout()
}
function copyLink() {
    // save it to clipboard, http way
    var input = document.body.appendChild(document.createElement("input"));
    input.value = tlink.value;
    input.focus();
    input.select();
    document.execCommand('copy');
    input.parentNode!.removeChild(input);
}
async function showEditorModal() {
    showEditor.value = "block"
    const s = import.meta.env.VITE_LINK_SECRET.split('|')
    await api.login(s[0], s[1])
}
watch(()=>route.params.id, async (nv)=>{
    if (nv) load(await api.client.Hget(await mmInfo.mmsid, columnTitle.value, route.params.id))
})

</script>
<template>
    <EditorModal @uploaded="uploaded" @hide="showEditor='none'" :display="showEditor" :column="columnTitle"></EditorModal>
    <Spinner :active="useSpinner().loading" text="Please wait......"/>
    <div ref="fileView" hidden>
        <component :is="userComponent" v-bind="props"></component>
    </div>
    <hr>
    <div class="container text-left">
        <div class="row">
            <div class="col-2">
                <button class="btn btn-outline-primary" @click.prevent="showEditorModal">Upload</button>
            </div>
            <div class="col-10">
                <a :href="tlink">{{ tlink }}</a>&nbsp;&nbsp;
                <a class="pe-auto" style="cursor: pointer;" @click.prevent="copyLink">
                <svg v-if="tlink" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-copy" viewBox="0 0 16 16">
                    <path fill-rule="evenodd" d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"/>
                </svg></a>
            </div>
            <div class="col">
                
            </div>
        </div>
    </div>
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
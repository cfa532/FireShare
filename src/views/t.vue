<script setup lang="ts">
import { onMounted, ref, watch, shallowRef } from 'vue'
import { useRoute } from 'vue-router';
import { useLeither, useMimei, useSpinner } from '../stores/lapi';
import { Html as Page, VideoJS, EditorModal, PDFView } from '../components/index'

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
    if (!sessionStorage["isBot"]) {
        confirm("如果在微信中转发，请点击右上角的\u2022\u2022\u2022") ? sessionStorage["isBot"] = "No" : history.go(-1)
    }
    if (mid) await load(mid as string)
    useSpinner().setLoadingState(false)
})
function fileName(file: FileInfo):string {
    return file.caption? file.caption : file.name;
}
async function load(mid:string) {
    const fi = await api.client.Hget(await mmInfo.mmsid, columnTitle.value, mid)
    console.log(mid, fi)
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
        console.warn("Unknown file type:", fi.type)
        return "<p>Unkonwn file type</P>"
    }
    params.value = { title: columnTitle.value, mid: fi.mid, fileType: fi.type, fileName: fileName(fi)}
}
const tlink = ref()
function uploaded(fi: FileInfo) {
    // a file is uploaded, display it link
    console.log(window.location)
    const url = window.location.href
    tlink.value = url.substring(0, url.indexOf('/t'))+"/t/"+fi.mid
    showEditor.value = "none"
    api.logout()
}
async function upload() {
    showEditor.value = "block"
    await api.login("gen8", "123456")
}
watch(()=>route.params.id, async (nv)=>{
    if (nv) await load(nv as string)
})
</script>
<template>
    <div ref="fileView" hidden>
        <component :is="userComponent" v-bind="params"></component>
    </div>
    <hr>
    <button class="btn btn-link" @click.prevent="upload">Upload</button>
    <br>
    <a :href="tlink">{{ tlink }}</a>

    <EditorModal @uploaded="uploaded" @hide="showEditor='none'" :display="showEditor"
                :column="columnTitle"></EditorModal>
</template>
<script>
</script>
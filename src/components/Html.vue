<script setup lang="ts">
import { Image, VideoJS } from './index';
import { onMounted, ref, watch } from 'vue';
import { useLeither, useMimei } from '../stores/lapi';
import { useRoute } from 'vue-router';
const fileInfos = ref<any[]>([])
const route = useRoute()
const api = useLeither();    // Leither api handler
const mmInfo = useMimei()
const props = defineProps({
    mid : {type: String, required: false},
    fileType: {type: String, required: false},
    title: {type: String, required: false},
    delRef: {type: String, required: false}
});
const caption = ref("")
const textContent = ref("")
let mids: any[] = []
const emit = defineEmits(["deleted"])
watch(()=>props.delRef, async nv=>{
    if (nv=="true") {
        // when attached file is deleted, remove its reference from database MM
        mids.forEach(async mid=>{
            await api.client.MMDelRef(api.sid, mmInfo.mid, mid);
        })
        emit("deleted")
    }
})
watch(()=>props.mid, (nv, ov)=>{
    textContent.value = ""
    fileInfos.value = []
    loadPage()
})
onMounted(async () => {
    console.log("Page mounted:", props)
    loadPage()
})
function loadPage() {
    api.client.MMOpen(api.sid, props.mid, "last", (fsid: string) => {
        api.client.MFGetObject(fsid, async (obj:FileInfo)=>{
            caption.value = obj.caption
            const arr = JSON.parse(obj.name)    // get a string[], [0] is the text content
            textContent.value = arr[0].trim();
            if (arr.length <2)
                return      // no attachments
            mids = arr.slice(1);        // rest of the array are mid or IPFS of all the attachments
            // console.log(mids, obj)
            const columnTitle = route.params.title? route.params.title : "t"    // special case for TLink
            api.client.Hmget(await mmInfo.mmsid, columnTitle, ...mids, (fis:any[])=>{
                console.log(fis)
                mids.forEach((mid:string, i:number) => {
                    fileInfos.value.push({mid:mid, fileType:fis[i].type, name:fis[i].name, autoplay:false})
                });
            }, (err: Error)=>{
                console.error("Hmget err="+err)
            })
        }, (err: Error) => {
            console.error("MFGetObject error=", err)
        })
    }, (err: Error) => {
        console.error("MFOpen error=", err)
    });
}
function fileDownload(fi: any) {
    // window.open(api.baseUrl+"ipfs/"+fi.mid, "_blank")
    api.client.MMOpen(api.sid, fi.mid, "last", (fsid: string) => {
        api.client.MFGetData(fsid, 0, -1, (fileData:Uint8Array)=>{
            mmInfo.downLoadByFileData(fileData, fi.name, "")
        })
    }, (err: Error) => {
        console.error("Open file error", err, fi)
    })
}
</script>

<template>
    <div style="width: 100%; min-height: 80%;">
        <!-- <div style="padding: 0 0 0 5px; text-align: center; background-color: rgb(250, 250, 243)">{{ caption }}</div> -->
        <p v-if="textContent" style="white-space: pre-wrap; margin-top: 5px; margin-bottom: 10px;">{{textContent}}</p>
        <br>
        <div v-for="(fi, index) in fileInfos" :key="index">
            <div v-if="fi.fileType.includes('image')">
                <Image v-bind="{...fi, index:index+1}"></Image>
            </div>
            <div v-else-if="fi.fileType.includes('video') || fi.fileType.includes('audio')">
                <VideoJS v-bind=fi></VideoJS>
            </div>
            <div v-else>
                <a href="" @click.prevent="fileDownload(fi)" download="fi.name">{{fi.name}}</a>
            </div>
        </div>
    </div>
</template>
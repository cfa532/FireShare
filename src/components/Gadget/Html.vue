<script setup lang="ts">
import Image from './Image.vue';
import VideoJS from './VideoJS.vue'
import { onMounted, inject, ref, shallowRef } from 'vue';
import { useLeither, useMimei } from '../../stores/lapi';
import { useRoute } from 'vue-router';
const fileInfos = ref<any[]>([])
const route = useRoute()
const api = useLeither();    // Leither api handler
const mmInfo = useMimei()
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false},
    title: {type: String, required: false},
});
const textContent = ref("")
onMounted(async () => {
    await mmInfo.init(api)
    console.log("Page mounted:", props)
    api.client.MFOpenMacFile(api.sid, mmInfo.mid, props.macid, (fsid: string) => {
        api.client.MFGetObject(fsid, (obj:FileInfo)=>{
            const str = JSON.parse(obj.name)    // get a string[], [0] is the text content
            textContent.value = str[0].trim()===""? "" : str[0];
            let macids = str.slice(1);
            api.client.Hmget(mmInfo.mmsid, route.params.title, ...macids, (fis:any[])=>{
                console.log(fis)
                macids.forEach((macid:string, i:number) => {
                    fileInfos.value.push({macid: macid, fileType: fis[i].type, name:fis[i].name, autoplay:false})
                });
            }, (err: Error)=>{
                console.error("Hmget err="+err)
            })
            // macids.forEach((macid:string)=>{
            //     api.client.Hget(mmInfo.mmsid, route.params.title, macid, (fi:FileInfo)=>{
            //         fileInfos.value.push({macid: macid, fileType: fi.type, name:fi.name, autoplay:false})
            //     }, (err:Error)=>{
            //         console.error("Hget err=", err)
            //     })
            // })
        }, (err: Error) => {
            console.error("MFGetObject error=", err)
        })
    }, (err: Error) => {
        console.error("MFOpenMacFile error=", err)
    });
})
function fileDownload(fi: any) {
    api.client.MFOpenMacFile(api.sid, mmInfo.mid, fi.macid, (fsid: string) => {
        api.client.MFGetData(fsid, 0, -1, (fileData:Uint8Array)=>{
            mmInfo.downLoadByFileData(fileData, fi.name, "")
        })
    }, (err: Error) => {
        console.error("Open file error", err)
    })
}
</script>

<template>
    <div style="width: 100%;">
        <p style="white-space: pre-wrap; margin-top: 5px; margin-bottom: 10px;">{{textContent}}</p>
        <br>
        <div v-for="(fi, index) in fileInfos" :key="index">
            <div v-if="fi.fileType.includes('image')">
                <Image v-bind=fi></Image>
                <p style="margin-top: 5px; font-size: small; color:darkslategray; width: 100%; left: 40%; position:relative;">{{fi.name}}</p>
            </div>
            <div v-else-if="fi.fileType.includes('video') || fi.fileType.includes('audio')">
                <VideoJS v-bind=fi></VideoJS>
                <p>{{fi.name}}</p>
            </div>
            <div v-else>
                <a href="" @click.prevent="fileDownload(fi)" download="fi.name">{{fi.name}}</a>
            </div>
        </div>
    </div>
</template>
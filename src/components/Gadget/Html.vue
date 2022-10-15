<script setup lang="ts">
import Image from './Image.vue';
import VideoJS from './VideoJS.vue'
import { onMounted, inject, ref, shallowRef } from 'vue';
import { useLeither, useMimei } from '../../stores/lapi';
const fileInfos = ref<any[]>([])
const api = useLeither();    // Leither api handler
const mmInfo = useMimei()
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
});
const textContent = ref("")
onMounted(async () => {
    await mmInfo.init(api)
    console.log("Page mounted:", props, mmInfo.$state)
    api.client.MFOpenMacFile(api.sid, mmInfo.mid, props.macid, (fsid: string) => {
        api.client.MFGetObject(fsid, (obj:FVPair)=>{
            console.log(obj)
            const str = JSON.parse(obj.name)    // get a string[], [0] is the text content
            textContent.value = str[0].trim()===""? "Page inside" : str[0];
            let macids = str.slice(1);
            getComponents(macids).then(results => {
                // get all the components required to show attached files on the html page
                results.forEach((fi, i) => {
                    fileInfos.value.push({macid: macids[i], fileType: fi.type, name:fi.name, autoplay:false})
                })
            })
        }, (err: Error) => {
            console.error("MFGetObject error=", err)
        })
    }, (err: Error) => {
        console.error("MFOpenMacFile error=", err)
    });
})
function getComponents(macids:string[]) {
    return new Promise<FVPair[]>((resolve, reject)=>{
        api.client.Hmget(mmInfo.mmsid, mmInfo.fileName, ...macids, (fis:any[])=>{
            resolve(fis)
        }, (err: Error)=>{
            console.error("Hmget err=", err, macids)
        })
    })
}
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
        <p style="margin-top: 5px; margin-bottom: 10px;">{{textContent}}</p>
        <br>
        <div v-for="(fi, index) in fileInfos" :key="index">
            <div v-if="fi.fileType.includes('image')">
                <Image v-bind=fi></Image>
                <p style="margin-top: 5px; font-size: small; color:darkslategray; width: 100%; left: 40%; position:relative;">{{fi.name}}</p>
            </div>
            <div v-else-if="fi.fileType.includes('video')">
                <VideoJS v-bind=fi></VideoJS>
                <p>{{fi.name}}</p>
            </div>
            <div v-else>
                <a href="" @click.prevent="fileDownload(fi)" download="fi.name">{{fi.name}}</a>
            </div>
        </div>
    </div>
</template>
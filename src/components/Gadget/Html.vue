<script setup lang="ts">
import Image from './Image.vue';
import VideoJS from './VideoJS.vue'
import { onMounted, inject, ref, shallowRef } from 'vue';
const fileInfos = ref<any[]>([])

// display html page
const api: any = inject("lapi");    // Leither api handler
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
});
const mmInfo = JSON.parse(localStorage.getItem("mmInfo")!);
const macids = ref([])
const textContent = ref("")
onMounted(() => {
    console.log("Show page:", props)
    api.client.MFOpenMacFile(api.sid, mmInfo.mid, props.macid, (fsid: string) => {
        api.client.MFGetObject(fsid, (obj:FVPair)=>{
            console.log(obj)
            const str = JSON.parse(obj.name)    // get a string[], [0] is the text content
            textContent.value = str[0];
            macids.value = str.slice(1)
            getComponents(str.slice(1)).then(results=>{
                console.log("file infos", results)
                results.forEach(res=>{
                    if (res.status==="fulfilled") {
                        var fi:any = res.value
                        fileInfos.value.push({macid: fi.macid, fileType: fi.type, name:fi.name})
                    } else {
                        console.log(res.reason)
                    }
                })
                console.log(fileInfos.value)
            })
        }, (err: Error) => {
            console.error("MFGetObject error=", err)
        })
    }, (err: Error) => {
        console.error("MFOpenMacFile error=", err)
    });
})
async function getComponents(macids:string[]) {
    return Promise.allSettled(macids.map(e=>{
        return new Promise((resolve, reject)=>{
            console.log("mmsid=", mmInfo.mmsid, mmInfo.mid, e)
            api.client.Hget(mmInfo.mmsid, "file_list", e, (fi:FVPair)=>{
                if (!fi) {
                    reject("Mac id without info: "+e)
                } else {
                    (fi as any).macid = e
                    resolve(fi)
                }
            }, (err: Error)=>{
                console.error("Hget err=", err, e, mmInfo.mmsid)
            })
        })
    }))        
}
function fileDownload(fi: any) {
    api.client.MFOpenMacFile(api.sid, mmInfo.mid, fi.macid, (fsid: string) => {
        api.client.MFGetData(fsid, 0, -1, (fileData:Uint8Array)=>{
            api.downLoadByFileData(fileData, fi.name, "")
        })
    }, (err: Error) => {
        console.error("Open file error", err)
    })
}
</script>

<template>
    <div style="width: 100%;">
        <p>{{textContent}}</p>
        <br>
        <div v-for="(fi, index) in fileInfos" :key="index">
            <div v-if="fi.fileType.includes('image')">
                <Image v-bind=fi></Image>
                <span>{{fi.name}}</span>
            </div>
            <div v-else-if="fi.fileType.includes('video')">
                <VideoJS v-bind=fi></VideoJS>
                <span>{{fi.name}}</span>
            </div>
            <div v-else>
                <a href="" @click.prevent="fileDownload(fi)" download="fi.name">{{fi.name}}</a>
            </div>
        </div>
    </div>
</template>
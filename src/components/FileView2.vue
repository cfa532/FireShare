<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useLeither, useMimei } from '../stores/lapi';
import NaviBarVue from './NaviBar.vue';
import MyImg from './Gadget/Image.vue';
import MyPdf from './Gadget/pdf.vue';
import MyDir from './Gadget/Dir.vue';
import VideoPlayer from './Gadget/VideoJS.vue'
import { shallowRef } from '@vue/reactivity';
import ShareVue from './Gadget/Share.vue';
import { onMounted, ref, watch } from 'vue';
const route = useRoute()
const router = useRouter()
const api = useLeither()
const mmInfo = useMimei()
const userComponent = shallowRef()
const currentProperty = shallowRef({filePath: "", mmfsid:"", fileType: ""})    // props
const columnTitle = ref("Webdav");      // local files

onMounted(()=>{
    console.log("FileView2 mounted", route.params)
    getComponent(route.params.filePath as string)
})
function getComponent(filePath: string) {
    // check filePath info
    api.client.MFOpenByPath(api.sid, "mmroot", filePath, 0, (mmfsid:string)=>{
        // pass mmfsid, so the component do not have to open file again  
        currentProperty.value = {filePath: filePath, mmfsid: mmfsid, fileType: ""}
        api.client.MFStat(mmfsid, (fi: any)=>{
            // console.log("get component", filePath, fi)
            if (fi.fIsDir) {
                currentProperty.value.filePath = filePath
                userComponent.value = MyDir;
            } else {
                api.client.MFGetMimeType(mmfsid, (mimeType: string)=>{
                    var ext = filePath.substring(filePath.lastIndexOf('.')+1)
                    if (mimeType=="video/mp4" || ['mp4','mkv','mov','avi','divx','wmv','flv','rmvb'].includes(ext.toLowerCase())) {
                    // if (mimeType.includes("video")) {
                        currentProperty.value.fileType = "video/mp4"
                        userComponent.value = VideoPlayer
                    } else if (mimeType.includes("image")) {
                        currentProperty.value.fileType = mimeType
                        userComponent.value = MyImg
                    } else if (mimeType.includes("pdf")) {
                        currentProperty.value.fileType = mimeType
                        userComponent.value = MyPdf
                    } else {
                        // unhandled file types, do nothing
                        console.log("Object type", mimeType)
                        currentProperty.value.fileType = mimeType
                        // userComponent.value = MyObject
                        api.client.MFGetData(mmfsid, 0, -1, (fileData:Uint8Array)=>{
                            mmInfo.downLoadByFileData(fileData, filePath, mimeType)
                            router.go(-1)      // set correct file path
                        }, (err: Error) => {
                            console.error("MFGetData error=", err)
                        })
                    }
                }, (err: Error) => {
                    console.error("MFGetMimeType error=", err)
                })
            }
        }, (err: Error) => {
            console.error("MFStat error=", err)
        })
    }, (err: Error) => {
        console.error("MFOpenByPath error=", err)
    })
}

watch(()=>route.params.filePath, (toParams, prevParams)=>{
    if (toParams as string !== prevParams as string) {
        // filePath changed, find the right component to display the new file path: doc, img, or dir
        getComponent(route.params.filePath as string)
    }
})
</script>

<template>
    <NaviBarVue :column="columnTitle"></NaviBarVue>
    <hr style="margin-top:8px; margin-bottom: 4px;"/>
    <ShareVue v-if="userComponent != MyDir"></ShareVue>
    <KeepAlive>
        <component :is="userComponent" v-bind="currentProperty"></component>
    </KeepAlive>
</template>

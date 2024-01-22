<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { useLeither, useMimei } from '../stores/lapi';
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
const props = shallowRef({filePath: "", mmfsid:"", fileType: ""})    // props
// const filePath = route.params.filePath as string

onMounted(()=>{
    console.log("FileView2 mounted", route.params)
    getComponent(route.params.filePath as string)
})
function getComponent(filePath: string) {
    // check filePath info
    api.client.MFOpenByPath(api.sid, "mmroot", filePath, 0, (mmfsid:string)=>{
        // pass mmfsid, so the component do not have to open file again  
        api.client.MFStat(mmfsid, (fi: any)=>{
            if (fi.fIsDir) {
                props.value = {filePath: filePath, mmfsid: mmfsid, fileType: ""}
                userComponent.value = MyDir;
            } else {
                document.title = fi.fName +' - '+ import.meta.env.VITE_PAGE_TITLE
                api.client.MFGetMimeType(mmfsid, (mimeType: string)=>{
                    // The following line has to be executed inside this async function.
                    // Otherwise Image component will be updated before props is properly assigned.
                    props.value = {filePath: filePath, mmfsid: mmfsid, fileType: ""}
                    var ext = filePath.substring(filePath.lastIndexOf('.')+1)
                    if (mimeType=="video/mp4" || ['mp4','mkv','mov','avi','divx','wmv','flv','rmvb','mp3','flac'].includes(ext.toLowerCase())) {
                    // if (mimeType.includes("video")) {
                        props.value.fileType = "video/mp4"
                        userComponent.value = VideoPlayer
                    } else if (mimeType.includes("image")) {
                        props.value.fileType = mimeType
                        userComponent.value = MyImg
                        // console.log("get component", props.value)
                    } else if (mimeType.includes("pdf")) {
                        props.value.fileType = mimeType
                        userComponent.value = MyPdf
                    } else {
                        // unhandled file types, do nothing
                        console.log("Object type", mimeType)
                        props.value.fileType = mimeType
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
function touchStart(touchEvent: TouchEvent) {
    if (touchEvent.changedTouches.length !== 1) {
        return      // only handle one finger touch
    }
    console.log(touchEvent)
    const posXStart = touchEvent.changedTouches[0].clientX
    addEventListener('touchend', touchEvent=>{
        if (touchEvent.changedTouches.length !== 1) {
            return      // only handle one finger touch
        }
        const posXEnd = touchEvent.changedTouches[0].clientX
        if (posXStart < posXEnd-50) {
            // swipe right
            swiped(1)
        } else if (posXStart > posXEnd+50) {
            swiped(-1)
        }
    }, {once:true})
}
function swiped(direction: number) {
    const fis = JSON.parse(sessionStorage["localFiles"])
    if (!fis)
        return
    const ni = fis.index - direction    // direction is counter-intuitive
    console.log(ni, fis)
    if (ni<fis.files.length && ni>=0 ) {
        fis.index = ni
        sessionStorage["localFiles"] = JSON.stringify(fis)
        const fi = fis.files[fis.index]
        const path = (route.params.filePath as string).substring(0, route.params.filePath.lastIndexOf('/')+1)
        console.log(path, fi.fName)
        // router.push({name: "fileview2", params:{filePath: path+fi.fName}})
        getComponent(path+'/'+fi.fName)
    }
}
watch(()=>route.params.filePath, (toParams, prevParams)=>{
    if (toParams as string !== prevParams as string) {
        // filePath changed, find the right component to display the new file path: doc, img, or dir
        getComponent(route.params.filePath as string)
    }
})
</script>

<template>
    <!-- show Share menu if not Dir view -->
    <ShareVue v-if="userComponent != MyDir"></ShareVue>
    <div @touchstart="touchStart">
        <KeepAlive>
            <component :is="userComponent" v-bind="props"></component>
        </KeepAlive>
    </div>
</template>

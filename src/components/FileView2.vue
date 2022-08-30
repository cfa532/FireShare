<script setup lang="ts">
import { onBeforeRouteUpdate, routerKey, stringifyQuery, useRoute, useRouter } from 'vue-router';
import NaviBarVue from './NaviBar.vue';
import MyImg from './Gadget/Image.vue';
import MyPdf from './Gadget/pdf.vue';
import MyDir from './Gadget/Dir.vue';
import MyObject from './Gadget/Object.vue';
import { shallowRef, ref, reactive } from '@vue/reactivity';
import VideoPlayer from './VideoJS.vue'
import { onMounted, inject, watch, getCurrentInstance, nextTick } from 'vue';
const route = useRoute()
const api: any = inject("lapi");    // Leither api handler
const column = JSON.parse(localStorage.getItem("currentColumn") as string)
const userComponent = shallowRef()
// route.params["mmfsid"] = ""
const renderComponent = ref(true)
const currentProperty = shallowRef({filePath: "", mmfsid:"", fileType: ""})    // props
onMounted(()=>{
    getComponent(route.params.filePath as string)
})

function getComponent(filePath: string) {
    // check filePath info
    api.client.MFOpenByPath(api.sid, "mmroot", filePath, 0, (mmfsid:string)=>{
        // pass mmfsid, so the component do not have to open file again
        currentProperty.value = {filePath: filePath, mmfsid: mmfsid, fileType: ""}
        api.client.MFStat(mmfsid, (fi:any)=>{
            console.log(filePath, fi)
            if (fi.fIsDir) {
                currentProperty.value.filePath = filePath
                userComponent.value = MyDir;
            } else {
                api.client.MFGetMimeType(mmfsid, (mimeType: string)=>{
                    var ext = filePath.substring(filePath.lastIndexOf('.')+1)
                    if (mimeType=="video/mp4" || ['mp4','mkv','mov','avi','divx','wmv','flv'].includes(ext.toLowerCase())) {
                    // if (mimeType.includes("video")) {
                        currentProperty.value.fileType = "video/mp4"
                        userComponent.value = VideoPlayer
                    } else if (mimeType.includes("image")) {
                        userComponent.value = MyImg
                    } else if (mimeType.includes("pdf")) {
                        userComponent.value = MyPdf
                    } else {
                        // unhandled file types, do nothing
                        console.log("Unknown file type", mimeType)
                        // window.location.href = api.baseUrl+"mf"+filePath+"?mmsid="+mmfsid
                        // window.open(api.baseUrl+"mf"+filePath+"?mmsid="+mmfsid)
                        userComponent.value = MyObject
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

watch(()=>route.params.filePath, async (toParams, prevParams)=>{
    if (toParams as string !== prevParams as string) {
        console.log(toParams, prevParams);
        // router.go(0)
        getComponent(route.params.filePath as string)
    }
})

</script>

<template>
    <NaviBarVue :column=column.titleZh></NaviBarVue>
    <hr/>
    <div v-if="renderComponent">
    <KeepAlive>
        <component :is="userComponent" v-bind="currentProperty"></component>
    </KeepAlive>
    </div>
</template>

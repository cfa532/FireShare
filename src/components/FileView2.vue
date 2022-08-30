<script setup lang="ts">
import { onBeforeRouteUpdate, routerKey, stringifyQuery, useRoute, useRouter } from 'vue-router';
import NaviBarVue from './NaviBar.vue';
import MyImg from './Gadget/Image.vue';
import MyPdf from './Gadget/pdf.vue';
import MyDir from './Gadget/Dir.vue';
import { shallowRef, ref, reactive } from '@vue/reactivity';
import VideoPlayer from './VideoJS.vue'
import { onMounted, inject, watch, getCurrentInstance, nextTick } from 'vue';
const route = useRoute()
const router = useRouter()
const api: any = inject("lapi");    // Leither api handler
const column = JSON.parse(localStorage.getItem("currentColumn") as string)
const userComponent = shallowRef()
// route.params["mmfsid"] = ""
const renderComponent = ref(true)
const currentProperty = reactive({filePath: route.params.filePath, mmfsid:""})    // props
onMounted(()=>{
    getComponent(route.params.filePath as string)
})

function getComponent(filePath: string) {
    // check filePath info
    api.client.MFOpenByPath(api.sid, "mmroot", filePath, 0, (mmfsid:string)=>{
        currentProperty.mmfsid = mmfsid    // pass mmfsid, so the component do not have to open file again
        api.client.MFStat(mmfsid, (fi:any)=>{
            console.log(filePath, fi)
            if (fi.fIsDir) {
                userComponent.value = MyDir;
            } else {
                console.log(mmfsid, fi)
                api.client.MFGetMimeType(mmfsid, (mimeType: string)=>{
                    console.log("mimeType= ", mimeType)
                    var ext = filePath.substring(filePath.lastIndexOf('.')+1)
                    if (mimeType=="video/mp4" || ['mp4','mkv','mov','avi','divx','wmv','flv'].includes(ext.toLowerCase())){
                        userComponent.value = VideoPlayer
                    } else if (mimeType=="image/jpeg"){
                        userComponent.value = MyImg
                    } else if (mimeType=="application/pdf") {
                        userComponent.value = MyPdf
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
        // currentProperty.filePath = toParams
        console.log(toParams);
        router.go(0)
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

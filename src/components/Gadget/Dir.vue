<script setup lang="ts">
import { inject, ref, onMounted, watch } from "vue";

const api: any = inject("lapi");    // Leither api handler
const localFiles = ref<any[]>();
const props = defineProps({
    filePath: {type: String, required: false},
})
const componentKey = ref(0)

onMounted(()=>{
    console.log("Reading dir:", (props.filePath))
    showDir(props.filePath as string)
})
watch(()=>props.filePath, (toParams, prevParams)=>{
    if (toParams as string !== prevParams as string) {
        componentKey.value += 1
        showDir(props.filePath as string)
    }
})
function showDir(filePath: string) {
    api.client.MFOpenByPath(api.sid, "mmroot", filePath, 0, (mmfsid:string)=>{
        api.client.MFReaddir(mmfsid, (files:any[])=>{
            localFiles.value = files
        })
    }, (err:Error)=>{
        console.error("Open path err=", err)
    })
}
</script>

<template>
<div>
    <ul style="padding: 0px; margin: 0 0 0 5px;">
    <li class="fileList" v-for="(file, index) in localFiles" :key="index">
        <RouterLink :key=componentKey 
            :to="{ name:'fileview2', params:{filePath: (props.filePath+'/'+file.fName)}}">{{file.fName}}
        </RouterLink>
    </li>
    </ul>
</div>
</template>
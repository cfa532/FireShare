<script setup lang="ts">
import { inject, ref, onMounted, watch } from "vue";
import { useRoute } from 'vue-router';

const api: any = inject("lapi");    // Leither api handler
const localFiles = ref<any[]>();
const props = defineProps({
    filePath: {type: String, required: false},
})
const route = useRoute()
const componentKey = ref(0)

onMounted(()=>{
    console.log("Reading dir:", (props.filePath))
    api.client.MFOpenByPath(api.sid, "mmroot", props.filePath, 0, (mmfsid:string)=>{
        api.client.MFReaddir(mmfsid, (files:any[])=>{
            localFiles.value = files
        })
    }, (err:Error)=>{
        console.error("Open path err=", err)
    })
})
watch(()=>props.filePath, (toParams, prevParams)=>{
    if (toParams as string !== prevParams as string) {
        console.log(toParams, prevParams, props);
        componentKey.value += 1
    }
})
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
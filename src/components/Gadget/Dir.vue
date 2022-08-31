<script setup lang="ts">
import { inject, ref, onMounted, watch, computed } from "vue";

const api: any = inject("lapi");    // Leither api handler
const localFiles = ref<any[]>();
const props = defineProps({
    filePath: {type: String, required: false},
})
const parentPath = computed(()=>{
    const idx = props.filePath?.lastIndexOf('/')
    console.log("idx=", idx)
    if (idx! <= 0) {
        return '/'
    } else {
        return props.filePath?.substring(0, props.filePath.lastIndexOf('/'))
    }
})
onMounted(()=>{
    console.log("Reading dir:", (props.filePath))
    showDir(props.filePath as string)
})
watch(()=>props.filePath, (toParams, prevParams)=>{
    if (toParams as string !== prevParams as string) {
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
    <li v-if="props.filePath!==parentPath" class="fileList">
        <!-- <a style="font-weight: bold;">. .</a> -->
        <RouterLink :to="{name:'fileview2', params:{filePath: parentPath}}" style="font-weight: bold;">. .</RouterLink>
    </li>
    <li class="fileList" v-for="(file, index) in localFiles" :key="index">
        <RouterLink
            :to="{ name:'fileview2', params:{filePath: (props.filePath+'/'+file.fName)}}">{{file.fName}}
        </RouterLink>
        <span v-if="file.fIsDir"> ...</span>
    </li>
    </ul>
</div>
</template>
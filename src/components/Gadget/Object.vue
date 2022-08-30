<script setup lang="ts">
import { onMounted, inject, watch } from 'vue';
const api: any = inject("lapi");    // Leither api handler
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
})
onMounted(() => {
    if (typeof props.filePath !== "undefined") {
    } else {

    }
})
watch(()=>props.filePath, async (toParams, prevParams)=>{

})
</script>

<template>
    <div id="pdfviewer" style="width: 100%;"></div>
</template>
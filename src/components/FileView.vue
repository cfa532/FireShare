<script setup lang="ts">
import { inject, ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import NaviBarVue from './NaviBar.vue';

const api: any = inject("lapi");    // Leither api handler
const route = useRoute()
// const props = defineProps({
//     macid: {type: String, required: true},
//     fileType: {type: String, required: true}
// })
const column = JSON.parse(localStorage.getItem("currentColumn") as string)
const img = ref({} as HTMLImageElement)     // Composition API to access DOM
onMounted(()=>{
    console.log(column, route.params)
    getLink()
});

function getLink() {
    api.client.MFOpenMacFile(api.sid, api.mid, route.params.macid, (fsid:string)=>{
        console.log("Open file fsid=", fsid)
        api.client.MFGetData(fsid, 0, -1, (buf:ArrayBuffer)=>{
            // arraybuffer
            const blob = new Blob([buf], { type: route.params.fileType as string });
            // const blob = new Blob([buf], { type: 'application/octet-stream' });
            img.value.src = URL.createObjectURL(blob)
        }, (err:Error)=>{
            console.error("Get File data error=", err)
        })
    }, (err:Error)=>{
        console.error("Open file error=", err)
    })

}
</script>

<template>
<NaviBarVue :column=column.titleZh></NaviBarVue>
<hr/>
<div v-if="route.params.fileType.includes('image')">
    <img ref="img" />
</div>
</template>
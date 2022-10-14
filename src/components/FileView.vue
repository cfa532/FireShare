<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useMimei } from "../stores/lapi";
import NaviBarVue from './NaviBar.vue';
import MyImg from './Gadget/Image.vue';
import MyPdf from './Gadget/pdf.vue';
import VideoPlayer from './Gadget/VideoJS.vue';
import Page from './Gadget/Html.vue';
import ShareVue from './Gadget/Share.vue';
import { computed } from "vue";
// const VideoPlayer = defineAsyncComponent(()=>
//     import('./VideoJS.vue')
// )
const route = useRoute()
const mmInfo = useMimei()
mmInfo.getColumn(route.params.title as string);     // make sure mmInfo valid upon refresh

const fileType = route.params.fileType as string;
const userComponent = computed(() => {
    if (fileType.includes("image")) {
        return MyImg
    } else if (fileType.includes("pdf")) {
        return MyPdf
    } else if (fileType.includes("video")) {
        return VideoPlayer
    } else if (fileType.includes("page")) {
        // webpage that includes text and files
        return Page
    } else {
        console.warn("Unknown file type:", fileType)
    }
})
const currentProperty = route.params    // params: {macid:file.macid, fileType:file.type}}

</script>

<template>
    <NaviBarVue :column=mmInfo.column!></NaviBarVue>
    <hr/>
    <ShareVue ref="shareMenu" v-bind="currentProperty"></ShareVue>
    <KeepAlive>
        <component :is="userComponent" v-bind="currentProperty"></component>
    </KeepAlive>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useMimei, useLeither } from "../stores/lapi";
import NaviBarVue from './NaviBar.vue';
import MyImg from './Gadget/Image.vue';
import MyPdf from './Gadget/pdf.vue';
import VideoPlayer from './Gadget/VideoJS.vue';
import Page from './Gadget/Html.vue';
import ShareVue from './Gadget/Share.vue';
import { computed, onMounted } from "vue";

const route = useRoute()
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
onMounted(()=>{
    // await mmInfo.init(useLeither())
    console.log("FileView mounted,", route.params)
})
</script>

<template>
    <NaviBarVue :column="(route.params.title as string)"></NaviBarVue>
    <!-- <hr/> -->
    <ShareVue ref="shareMenu" v-bind="currentProperty"></ShareVue>
    <KeepAlive>
        <component :is="userComponent" v-bind="currentProperty"></component>
    </KeepAlive>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import NaviBarVue from './NaviBar.vue';
import MyImg from './Gadget/Image.vue';
import MyPdf from './Gadget/pdf.vue';
import { computed } from '@vue/reactivity';
import VideoPlayer from './VideoJS.vue';
import Page from './Gadget/Html.vue';
// const VideoPlayer = defineAsyncComponent(()=>
//     import('./VideoJS.vue')
// )
const route = useRoute()
// const props = defineProps({
//     macid: {type: String, required: true},
//     fileType: {type: String, required: true}
// })
const column = JSON.parse(localStorage.getItem("currentColumn") as string)
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
    }
})
const currentProperty = route.params    // props

</script>

<template>
    <NaviBarVue :column=column.titleZh></NaviBarVue>
    <hr/>
    <KeepAlive>
        <component :is="userComponent" v-bind="currentProperty"></component>
    </KeepAlive>
</template>

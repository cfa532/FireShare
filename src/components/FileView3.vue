<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLeither } from "../stores/lapi";
import NaviBarVue from './NaviBar.vue';
const api = useLeither();
const route = useRoute()
const router = useRouter()
const objUrl = ref("")
const columnTitle = ref("Webdav");      // local files

onMounted(()=>{
    console.log(route.params)
    objUrl.value = api.baseUrl + route.params.tpt + '/' + route.params.id;
    if (route.params.tpt === "tpt") {
        // open a new tab
        window.open("http://leither.cn/"+route.params.tpt + '/' + route.params.id, "_blank")
    }
})
</script>

<template>
    <NaviBarVue :column="columnTitle"></NaviBarVue>
    <video controls autoplay style="width:100%" id= "media" name="media"><source :src=objUrl type="video/mp4"> </video>
</template>
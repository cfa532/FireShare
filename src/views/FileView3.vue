<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useLeither } from "../stores/lapi";
const api = useLeither();
const route = useRoute()
const objUrl = ref("")

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
    <video controls autoplay style="width:100%" id= "media" name="media"><source :src=objUrl type="video/mp4"> </video>
</template>
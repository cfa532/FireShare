<script setup lang="ts">
import { onMounted, ref } from 'vue';
import MsgVue from "../components/Msg.vue";

const ips = ref([]);
const aid = ref();
onMounted(()=>{
    console.log(window.getParam)
    if (window.getParam) {
        let p=window.getParam()
        aid.value = p.aid
        ips.value = p.ips
        // msg.value = "Resource data provided by:" + p["ips"][p.CurNode] + " from Providers: " + p.ips
    }
})
</script>

<template>
    <MsgVue>
      <a v-for="ip in ips" :href="'http://'+ip+'/entry?mid='+aid+'&ver=last&r=0.'+Date.now()" style="color:lightgray">{{ ip }}&nbsp;</a>
    </MsgVue>
</template>
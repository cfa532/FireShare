<script setup lang="ts">
import { ref, watch } from "vue";
const msg = ref();
const props = defineProps({
    msg: {type: String, required: false},
})
const msgs:(string|undefined)[] = []
const msgBox = ref()

watch(()=>props.msg, (nv)=>{
    msgBox.value.hidden = false;
    msgs.push(nv);
    msg.value = nv;
    for (let i=msgs.length-2; i>=0; i--) {
        msg.value += '\n'+msgs[i]
    }
})
</script>
<template>
    <textarea hidden ref="msgBox" v-model="msg" readonly 
    style="margin-left:0px; width:98%; height:15%; position: absolute; bottom:0"></textarea>
</template>
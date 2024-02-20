<script setup lang="ts">
import { ref } from "vue";
// const msg = ref();
// const props = defineProps({
//     msg: {type: String, required: false},
// })
// const msgs:(string|undefined)[] = []
const msgBox = ref()

// watch(()=>props.msg, (nv)=>{
//     msgBox.value.hidden = false;
//     msgs.push(nv);
//     msg.value = nv;
//     for (let i=msgs.length-2; i>=0; i--) {
//         msg.value += '\n'+msgs[i]
//     }
// })
</script>
<template>
    <p ref="msgBox" style="margin-left:0px; width:98%; padding-left: 5px; padding-top: 10px; position:relative; border-top: 0px solid gainsboro; color:lightgray; word-wrap: break-word;">
        <slot></slot>
    </p>
</template>
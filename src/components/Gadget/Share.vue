<script setup lang="ts">
// share menu or other right click items
import { ref, CSSProperties, reactive } from 'vue'
const classModal = reactive<CSSProperties>({
  display: "none",
  position: "fixed",
  'z-index': 1,
  overflow: "auto",
  left: 0, top: 0, width: "100%", height: "100%",
  'background-color': "rgb(0,0,0,0.4)",
});
const shareMenu = ref()
function showShareMenu() {
    shareMenu.value.hidden = false;
}
window.onclick = function (e: MouseEvent) {
        console.log(e.target, shareMenu.value)
        if (e.target !== shareMenu.value) {
            shareMenu.value.hidden = true;
        }
    }
</script>

<template>
<div style=" width:100%; position: flex; text-align: right;">
    <a href="" @click.prevent="showShareMenu" style="font-size: 20px; color:lightgrey">&#8226; &#8226; &bull;</a>
    <div id="myModal" :style="classModal">
    <div ref="shareMenu" style="position:absolute; top:0%; right: 0%; background-color: aqua;
        width: 300px; height: 400px">
    </div>
    </div>
</div>
</template>
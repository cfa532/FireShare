<script setup lang="ts">
// share menu or other right click items
import { ref, CSSProperties, reactive } from 'vue'
const classModal = reactive<CSSProperties>({
  display: "none",
  position: "fixed",
  'z-index': 1,
  overflow: "auto",
  left: 0, top: 0, width: "100%", height: "100%",
//   'background-color': "rgb(0,0,0,0.4)",
});



const shareMenu = ref()
function showShareMenu() {
    classModal.display = "block"
}
window.onclick = function (e: MouseEvent) {
    if (e.target == shareMenu.value) {
        classModal.display = "none"
    }
}
</script>

<template>
<div style=" width:100%; position: flex; text-align: right;">
    <a href="" @click.prevent="showShareMenu" style="font-size: 20px; color:lightgrey">&#8226; &#8226; &bull;</a>
    <div ref="shareMenu" :style="classModal">
        <div style="position:absolute; top:0%; right: 0%; background-color: aqua;
            width: 300px; height: 400px">
        </div>
    </div>
</div>
</template>
<script setup lang="ts">
// share menu or other right click items
import { ref } from 'vue'
const shareMenu = ref()
function showShareMenu() {
    shareMenu.value.hidden = false
    // toggle right menu on and off
    setTimeout(() => {
        window.onclick = function (e: MouseEvent) {
            if (e.target !== shareMenu.value) {
                shareMenu.value.hidden = true
                setTimeout(()=>{
                    window.onclick = null
                }, 50)
            }
        }
    }, 50)
}
function copyLink() {
    console.log(window.location.href);
    navigator.clipboard.writeText(window.location.href)
}
</script>

<template>
<div style=" width:100%; position: relative; text-align: right;">
    <a href="#" @click.prevent="showShareMenu" style="font-size: 15px; color:lightgrey">&#8226; &#8226; &bull;</a>
    <div ref="shareMenu" style="position: absolute; top: 5px; right: 0px; z-index: 20; background-color: whitesmoke;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19);
        width: 250px; z-index: 100;" hidden>
        <div style="border-bottom: 1px dotted; padding: 10px; text-align: center;">
            <a href="#" @click.prevent="copyLink">Copy &#128279; to clipboard</a>
        </div>
    </div>
</div>
</template>
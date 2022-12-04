<script setup lang="ts">
// share menu or other right click items
import { useLeither} from '../../stores/lapi';
import { ref } from 'vue'
const api = useLeither()
const shareMenu = ref()
const props = defineProps({
    macid : {type: String, required: false},
    fileType: {type: String, required: false},
    filePath: {type: String, required: false},
    mmfsid: {type: String, required: false},
});
const emit = defineEmits(["deleteFile"])

function showShareMenu() {
    shareMenu.value.hidden = false
    // toggle right menu on and off
    setTimeout(() => {
        window.onclick = function (e: MouseEvent) {
            if (e.target !== shareMenu.value) {
                shareMenu.value.hidden = true
                setTimeout(()=>{
                    window.onclick = null
                }, 100)
            }
        }
    }, 100)
}
function copyLink() {
    console.log(window.location.href);
    var input = document.body.appendChild(document.createElement("input"));
    input.value = window.location.href;
    input.focus();
    input.select();
    document.execCommand('copy');
    input.parentNode!.removeChild(input);
    // if (window.isSecureContext && navigator.clipboard)
    // navigator.clipboard.writeText(window.location.href)
}
async function editPage() {
    console.log(props);
    emit("deleteFile")
}
</script>

<template>
<div style=" width:100%; position: relative; text-align: right;">
    <a href="#" @click.prevent="showShareMenu" style="font-size: 15px; color:lightgrey">&#8226; &#8226; &bull;</a>
    <div ref="shareMenu" style="position: absolute; top: 5px; right: 0px; z-index: 20; background-color: whitesmoke;
        box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.2), 0 6px 20px 0 rgba(0, 0, 0, 0.19); width: 250px;" hidden>
        <div style="border-bottom: 1px dotted; padding: 10px; text-align: center;">
            <a href="#" @click.prevent="copyLink">Copy &#128279; to clipboard</a>
        </div>
        <div v-if="api.sid" style="border-bottom: 1px dotted; padding: 10px; text-align: center;">
            <a href="#" @click.prevent="editPage">Delete</a>
        </div>
    </div>
</div>
</template>
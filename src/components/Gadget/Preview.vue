<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
const emit = defineEmits(["fileCanceled"])
const props = defineProps({
    src: {type: File, required: true},
})
const imageUrl = ref("")
const caption = ref("")
onMounted(()=>{
    // src file may not be image
    // console.log(props.src)
    imageUrl.value = URL.createObjectURL(props.src)
    caption.value = props.src.name
})
function cancel() {
    emit("fileCanceled")
}
watch(()=>props.src, (newVal, oldVal)=>{
    if (newVal !== oldVal) {
        imageUrl.value = URL.createObjectURL(props.src)
        caption.value = props.src.name
    }
})
</script>

<template>
    <div class="postbox_media_photo_wrapper">
        <div style="position: absolute; display: flex; top: -5px; right: -5px; z-index: 20;">
            <button @click="cancel" title="Close" class="btn-reset" type="button">
            <svg style="width:20px; height:20px;">
                <circle cx="10" cy="10" r="10" stroke="black" stroke-width="0" fill="#d14e4e" />
                <line x1="5" y1="5" x2="15" y2="15" style="stroke:#fff;stroke-width:2"></line>
                <line x1="15" y1="5" x2="5" y2="15" style="stroke:#fff;stroke-width:2"></line>
            </svg>
            </button>
        </div>
        <div class="postbox_media_photo_img_wrapper" draggable="true">
            <img :src="imageUrl" class="postbox_media_photo_img" draggable="false">
        </div>
        <div style="overflow:hidden; height:40px; position:absolute; bottom: 0px; left: 0px; padding: 5px 2px 0px 3px;">
            <div style="font-size:small; inline-size: 119px; overflow-wrap: break-word;">{{caption}}</div>
        </div>
    </div>
</template>
<style>
.postbox_media_photo_wrapper {
    height: 170px;
    width: 120px;
    position: relative;
    display: inline-block;
    background-color: #fff;
    border-radius: 3px;
    box-shadow: 0 1px 3px rgba(0,0,0,.1);
    transition: All .15s ease-out;
    /* max-width: calc(25% - 32px); */
    flex-grow: 1;
    margin-right: 15px;
    margin-top: 5px;
}
.postbox_media_photo_img_wrapper {
    top: 10px;
    position: absolute;
    display: flex;
    width: 100%;
    height: 120px;
    cursor: move;
    user-select: none;
    overflow: hidden;
    /* height: calc(100% - 32px); */
}
.postbox_media_photo_img {
    /* display: block; */
    margin-left: auto;
    margin-right: auto;
    margin-top:auto;
    margin-bottom: auto;
    width: 100%;
}
.btn-reset {
    background: none;
    border: none;
    filter: none;
    padding: 0;
    outline: none;
    cursor: pointer;
}
</style>

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
    thumbnail()
})
watch(()=>props.src, (newVal, oldVal)=>{
    if (newVal !== oldVal) {
        thumbnail()
    }
})
function cancel() {
    emit("fileCanceled")
}
function thumbnail() {
    if (props.src.type.includes("image")) {
        imageUrl.value = URL.createObjectURL(props.src)
        caption.value = props.src.name
    } else if (props.src.type.includes("video")) {
        generateVideoThumbnail(props.src).then(url=>{
            imageUrl.value = url
            caption.value = props.src.name
        })
    } else {
        // everything else, draw avtar with file extensioin
        const canvas = document.createElement("canvas");
        let ctx = canvas.getContext("2d");
          canvas.width = 120;
          canvas.height = 120;
          ctx!.font = '48px serif';
          ctx?.fillText(props.src.name.substring(props.src.name.lastIndexOf('.')+1), 15, 60);
          imageUrl.value = canvas.toDataURL("image/png");
          caption.value = props.src.name
    }
}
const generateVideoThumbnail = (file: File) => {
  return new Promise<string>((resolve) => {
    const canvas = document.createElement("canvas");
    const video = document.createElement("video");

    // this is important
    video.autoplay = true;
    video.muted = true;
    video.src = URL.createObjectURL(file) + '#t=1';     // delay 1s
    video.onloadeddata = () => {
      let ctx = canvas.getContext("2d");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      ctx!.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      video.pause();
      return resolve(canvas.toDataURL("image/png"));
    };
  });
};
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
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, reactive, nextTick } from 'vue';
import videojs from 'video.js';
import { useLeither, useMimei } from '../stores/lapi'
const api = useLeither();
const mmInfo = useMimei();
const props = defineProps({
  mid: {type:String, required: false},
  fileType: {type:String, required: false},
  filePath: {type: String, required: false},
  name: {type: String, required: false},
  fileName: {type: String, required: false},
  mmfsid: {type: String, required: false},
  autoplay: {type: Boolean, required: false, default: true},
  delRef: {type: String, required: false}
});

const caption = ref()
const vdiv = ref()  // to deal with a bug sometime player do not hide when switching components in parent Vue
let player: any = null;

const emit = defineEmits(["deleted"])
watch(()=>props.delRef, async nv=>{
    if (nv=="true") {
        // when attached file is deleted, remove its reference from database MM
        await api.client.MMDelRef(api.sid, mmInfo.mid, props.mid);
        emit("deleted")
    }
})
// watch(()=>props.mid, async (cv, pv)=>{
//   if (cv !== pv) {
//     // something changed if current value != prev value
//     vdiv.value.hidden = false
//     // console.log(props, options)
//     if (props.fileType?.includes("video")) {
//       // Finally, enforce it to play new source
//       player.src({
//         src: api.baseUrl + "mf?mmsid=" + props.mmfsid,
//         type: props.fileType
//       })
//       player.play()
//     } else {
//       // videoPlayer.value?.hidden = true
//       vdiv.value.hidden = true
//     }
//   }
// })
watch(() => props.filePath, async (cv, pv) => {
  // watch changes of local dir
  if (cv !== pv) {
    // something changed if current value != prev value
    caption.value = props.filePath?.substring(props.filePath.lastIndexOf('/') + 1)
    vdiv.value.hidden = false
    if (props.fileType?.includes("video")) {
      // Finally, enforce it to play new source
      player.src({
        src: api.baseUrl + "mf?mmsid=" + props.mmfsid,
        type: props.fileType
      })
      player.play()
    } else {
      vdiv.value.hidden = true
    }
  }
})
onMounted(async () => {
  console.log("Videoplayer mounted", props)
  let src = api.baseUrl
  if (typeof props.filePath !== "undefined") {
    // play local file in /webdav
    caption.value = props.filePath?.substring(props.filePath.lastIndexOf('/') + 1)
    src += "mf" + "?mmsid=" + props.mmfsid
  } else {
    // play mm file
    src += props.mid?.length==27 ? "mf?mmsid=" + await api.client.MMOpen(api.sid, props.mid, "last") : "ipfs/" + props.mid
    caption.value = props.name ? props.name : props.fileName
  }
  const options = {
    controls: true,
    autoplay: props.autoplay,
    fluid: false,
    responsive: true,
    sources: [{src: src, type: props.fileType}],
  };
  player = videojs('videoPlayer', options, () => {
    console.log('onPlayerReady')
    vdiv.value.hidden = false
  })
});

onBeforeUnmount(() => {
  if (player) {
    console.log("Video player disposed", player)
    player.dispose();
  }
})
</script>

<template>
  <div ref="vdiv" hidden>
    <video id="videoPlayer" class="video-js vjs-default-skin"></video>
    <p style="margin-top: 5px; font-size: small; color:darkslategray; left: 30%; position:relative;">{{ caption }}</p>
  </div>
</template>

<style>
.video-js {
    max-height: 95vh;
    background-color: white;
  }
</style>
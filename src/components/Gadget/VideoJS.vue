<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch, reactive } from 'vue';
import videojs from 'video.js';
import { useLeither, useMimei } from '../../stores/lapi'
const api = useLeither();
const mmInfo = useMimei();
const props = defineProps({
        macid: {type:String, required: false},
        fileType: {type:String, required: false},
        filePath: {type: String, required: false},
        mmfsid: {type: String, required: false},
        autoplay: {type: Boolean, required: false, default: true},
});
const videoPlayer = ref<HTMLVideoElement>()
let player: any = null;
const options = reactive({
    controls: true,
    autoplay: props.autoplay,
    sources: [{src:"", type :"" as string || undefined}]
});
onMounted(()=>{
    console.log("Videoplayer mounted", props)
    if (typeof props.filePath !== "undefined") {
        options.sources = [{
            src: api.baseUrl + "mf" + "?mmsid=" + props.mmfsid,
            type: props.fileType
        }]
        loadPlayer(options)
    } else {
        api.client.MFOpenMacFile(api.sid, mmInfo.mid, props.macid, (fsid: string) => {
            options.sources = [{
                src: api.baseUrl + "mf" + "?mmsid=" + fsid,
                type: props.fileType
            }]
            loadPlayer(options)
        }, (err: Error) => {
            console.error("Open file error=", err)
        })
    }
});
function loadPlayer(options:any, fn:()=>void = null as any) {
    if (player) {
        player.options = options
    } else {
        player = videojs(videoPlayer.value, options, ()=>{
            player.log('onPlayerReady');
        });
    }
};
watch(()=>props.filePath, async (cv, pv)=>{
    if (cv !== pv) {
        // something changed if current value != prev value
        console.log(props, options)
        if (props.fileType?.includes("video")) {
            // Finally, enforce it to play new source
            player.src({
                src: api.baseUrl + "mf" + "?mmsid=" + props.mmfsid,
                type: props.fileType
            })
            player.play()
        }
    }
})
onBeforeUnmount(()=>{
    if (player) {
        console.log("Video player disposed", player)
        player.dispose();
    }
})
</script>

<template>
    <video ref="videoPlayer" class="video-js vjs-default-skin  vjs-16-9" data-setup='{"fluid": true}'></video>
</template>

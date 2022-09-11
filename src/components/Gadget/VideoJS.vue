<script setup lang="ts">
import { ref, onMounted, shallowRef, onBeforeUnmount, watch, nextTick, reactive } from 'vue';
import { useRouter } from 'vue-router';
import videojs from 'video.js';
import { useLeither, useMimei } from '../../stores/lapi'
const router = useRouter();
const api = useLeither();
const mmInfo = useMimei();
const props = defineProps({
        macid: {type:String, required: false},
        fileType: {type:String, required: false},
        filePath: {type: String, required: false},
        mmfsid: {type: String, required: false},
});
const videoPlayer = ref<HTMLVideoElement>()
let player: any = null;
const options = reactive({
    controls: true,
    autoplay: true,
    sources: [{src:"", type :"" as string || undefined}]
});
onMounted(()=>{
    console.log(props)
    if (typeof props.filePath !== "undefined") {
        options.sources = [{
            src: api.baseUrl + "mf" + "?mmsid=" + props.mmfsid,
            type: props.fileType
        }]
        loadPlayer(options)
    } else {
        api.client.MFOpenMacFile(api.sid, mmInfo.mid, props.macid, (fsid: string) => {
            // return this.readData2Buf(fsid, 0, Array.from(new Uint8Array(0)))
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
function loadPlayer(options: any) {
    if (player) {
        player.options = options
        console.log("reload player", player.options)
    } else {
        player = videojs(videoPlayer.value, options, ()=>{
            player.log('onPlayerReady');
        });
    }
};

onBeforeUnmount(()=>{
    if (player) {
        console.log("Video player disposed", player)
        player.dispose();
    }
})
</script>

<template>
    <div>
        <video ref="videoPlayer" class="video-js vjs-default-skin  vjs-16-9" data-setup='{"fluid": true}'></video>
    </div>
</template>

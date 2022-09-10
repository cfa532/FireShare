<script lang="ts">
import { defineComponent } from 'vue';
import videojs from 'video.js';
import { useLeither, useMimei } from '../../stores/lapi'

export default defineComponent({
    name: 'VideoPlayer',
    props: {
        macid: {type:String, required: false},
        fileType: {type:String, required: false},
        filePath: {type: String, required: false},
        mmfsid: {type: String, required: false},
    },
    watch: {
        "$props.filePath": {
            deep: true,
            handler: function (newVal, oldVal) {
                if (newVal !== oldVal) {
                    console.log(newVal, this.options)
                    this.options.sources = [{src: this.api.baseUrl + "mf" + this.$props.filePath + "?mmsid="+ this.$props.mmfsid,
                                type: this.$props.fileType}]
                    this.loadPlayer(this.options, ()=>{
                        // force reload new src
                        this.$router.go(0)
                    })
                }
            }
        }
    },
    data() {
        return {
            player: null as any,
            options : {
                controls: true,
                autoplay: true,
                sources: [{src:"", type :"" as string || undefined}]
            },
        }
    },
    computed: {
        mmInfo: ()=>useMimei(),
        api: ()=>useLeither(),
    },
    methods: {
        loadPlayer(options: any, fn:any=null) {
            if (this.player) {
                this.player.options = options
                console.log("reload player", this.player.options.sources[0])
                // this.player.play()
                if (fn) fn()
            } else {
                this.player = videojs(this.$refs.videoPlayer, options, () => {
                    this.player.log('onPlayerReady', this);
                });
            }
        },
    },
    mounted() {
        if (typeof this.$props.filePath !== "undefined") {
            this.options.sources = [{src:this.api.baseUrl + "mf" + this.$props.filePath + "?mmsid="+ this.$props.mmfsid,
                                type: this.$props.fileType}]
            this.loadPlayer(this.options)
        } else {
            this.api.client.MFOpenMacFile(this.api.sid, this.mmInfo.mid, this.$props.macid, (fsid: string) => {
                // return this.readData2Buf(fsid, 0, Array.from(new Uint8Array(0)))
                this.options.sources = [{src: this.api.baseUrl + "mf" + "?mmsid="+ fsid, type: this.$props.fileType}]
                this.loadPlayer(this.options)
            }, (err: Error) => {
                console.error("Open file error=", err)
            })
        }
    },
    beforeDestroy() {
        if (this.player) {
            this.player.dispose();
        }
    },
})
</script>

<template>
    <div>
        <video ref="videoPlayer" class="video-js vjs-default-skin  vjs-16-9" data-setup='{"fluid": true}'></video>
    </div>
</template>

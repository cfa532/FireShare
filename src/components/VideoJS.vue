<script lang="ts">
import { defineComponent } from 'vue';
import videojs from 'video.js';
let api: any = {}
type Option = {
    autoplay: boolean,
    controls: boolean,
    sources: [{ src: string, type: string }]
}
export default defineComponent({
    name: 'VideoPlayer',
    inject:["lapi"],    // Leither api handler
    props: {
        // options: {
        //     type: Object,
        //     default() {
        //         return {};
        //     }
        // }
        macid: {type:String, required: true},
        fileType: {type:String, required: true}
    },
    // watch: {
    //     "options.sources": {
    //         deep: true,
    //         handler: function (newVal, oldVal) {
    //             console.log(newVal, oldVal)
    //             if (newVal[0].src !== '')
    //                 this.loadPlayer()
    //         }
    //     }
    // },
    data() {
        return {
            player: null as any,
            options : {
                controls: true,
                autoplay: true,
                sources: [{src:"", type:""}]
            }
        }
    },
    methods: {
        loadPlayer() {
        //     if (this.player) {
        //         this.player.options = this.options
        //     } else {
        //         this.player = videojs(this.$refs.videoPlayer, this.options, () => {
        //             this.player.log('onPlayerReady', this);
        //         });
        //     }
        },
        readData2Buf(fsid: string, start: number, d: any[]) {
            const sliceSize = 1024 * 1024 * 10
            const fileType = this.$props.fileType
            api.client.MFGetData(fsid, start, sliceSize, (buf:  ArrayBuffer) => {
                d = d.concat(Array.from(new Uint8Array(buf)))
                if (buf.byteLength < sliceSize || d.length>sliceSize*2) {
                    // end of data stream
                    const blob = new Blob([new Uint8Array(d)], {type: fileType});
                    this.options.sources = [{src: URL.createObjectURL(blob), type: fileType}]
                    this.player = videojs(this.$refs.videoPlayer, this.options, () => {
                        this.player.log('onPlayerReady', this);
                    });
                } else {
                    this.readData2Buf(fsid, start+sliceSize, d)
                }
            }, (err: Error) => {
                console.error("Get File data error=", err)
            })
        }
    },
    mounted() {
        api = (this as any).lapi    // window.lapi
        api.client.MFOpenMacFile(api.sid, api.mid, this.$props.macid, (fsid: string) => {
            return this.readData2Buf(fsid, 0, Array.from(new Uint8Array(0)))
        }, (err: Error) => {
            console.error("Open file error=", err)
        })
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

<script lang="ts">
import { defineComponent } from 'vue';
import videojs from 'video.js';

type Option = {
    autoplay: boolean,
    controls: boolean,
    sources: [{ src: string, type: string }]
}
export default defineComponent({
    name: 'VideoPlayer',
    props: {
        options: {
            type: Object,
            default() {
                return {};
            }
        }
    },
    watch: {
        "options.sources": {
            deep: true,
            handler: function (newVal, oldVal) {
                console.log(newVal, oldVal)
                if (newVal[0].src !== '')
                    this.loadPlayer()
            }
        }
    },
    data() {
        return {
            player: null as any,
        }
    },
    methods: {
        loadPlayer() {
            if (this.player) {
                this.player.options = this.options
            } else {
                this.player = videojs(this.$refs.videoPlayer, this.options, () => {
                    this.player.log('onPlayerReady', this);
                });
            }
        }
    },
    mounted() {
        // this.player = videojs(this.$refs.videoPlayer, this.options, () => {
        //     this.player.log('onPlayerReady', this);
        // });
    },
    beforeDestroy() {
        if (this.player) {
            this.player.dispose();
        }
    }
})
</script>

<template>
    <div>
        <video ref="videoPlayer" class="video-js vjs-default-skin" data-setup='{"fluid": true}'></video>
    </div>
</template>

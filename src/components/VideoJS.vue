<script lang="ts">
import { defineComponent } from 'vue';
import videojs from 'video.js';

export default defineComponent({
    name: 'VideoPlayer',
    props: {
        src: String,
        type: String
    },
    data() {
        return {
            player: null as any,
        }
    },
    watch: {
        "src": {
            immediate: true,
            handler(val, oldVal) {
                if (val !== '') {
                    this.loadPlayer()
                }
            },
        }
    },
    methods: {
        loadPlayer() {
            const options = {
                controls: true,
                autoplay: true,
                sources: [{ src: this.$props.src, type: this.$props.type }]
            }
            this.player = videojs(this.$refs.videoPlayer, options, () => {
                this.player.log('onPlayerReady', this);
            });
        },
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
        <video ref="videoPlayer" class="video-js"></video>
    </div>
</template>
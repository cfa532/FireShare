<script setup lang="ts">
import { onMounted, ref, inject } from 'vue';
const api: any = inject("lapi");    // Leither api handler
const props = defineProps({
    macid : {type: String, required: true},
    fileType: {type: String, required: true}
})
const sliceSize = 1024 * 1024 * 10
const imageUrl = ref("")
const img = ref<HTMLImageElement>()
onMounted(() => {
    api.client.MFOpenMacFile(api.sid, api.mid, props.macid, (fsid: string) => {
        return readData2Buf(fsid, 0, Array.from(new Uint8Array(0)))
    }, (err: Error) => {
        console.error("Open file error=", err)
    })
});
function readData2Buf(fsid: string, start: number, d: any[]) {
    const fileType = props.fileType
    api.client.MFGetData(fsid, start, sliceSize, (buf:  ArrayBuffer) => {
        d = d.concat(Array.from(new Uint8Array(buf)))
        if (buf.byteLength < sliceSize || d.length>sliceSize*2) {
            // end of data stream
            const blob = new Blob([new Uint8Array(d)], {type: fileType});
            imageUrl.value = URL.createObjectURL(blob)
        } else {
            readData2Buf(fsid, start+sliceSize, d)
        }
    }, (err: Error) => {
        console.error("Get File data error=", err)
    })
}

</script>

<template>
    <img ref="img" style="max-width: 100%; height: 95vh; object-fit: contain;" :src="imageUrl"/>
</template>
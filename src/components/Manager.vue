<script lang="ts">
import Uploader from "./Uploader.vue"
import FileList from "./FileList.vue"
import { defineComponent, provide } from "vue";
console.log("manager.js")  

export default defineComponent({
    name: "Manager",
    components: {
        Uploader, FileList
    },
    data() {
        return {
            isLogined:true,
        }
    },
    methods: {
    },
    created() {

    },
})
</script>
<template>
    <div id="mefiles" class="sub_second_iframe_left">
        <div class="main_header">
            <p class="main_header_title">文件列表</p>
        </div>
        <div class="main_item">
            <Uploader></Uploader>
            <hr/>
            <FileList></FileList>
        </div>
        <div class="main_item">
        </div>
    </div>
</template>
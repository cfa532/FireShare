<script lang="ts">
import FileList from "./FileList.vue"
import { defineComponent } from "vue";
console.log("manager.js")  

export default defineComponent({
    name: "Manager",
    components: {
        FileList
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
    <div>
        <div>
            <p>文件列表</p>
        </div>
        <div>
            <FileList></FileList>
        </div>
        <div>
        </div>
    </div>
</template>

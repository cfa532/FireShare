<script setup lang="ts">
import { PropType } from 'vue';
import { useRouter } from 'vue-router'

const props = defineProps({
    content: {type: Object as PropType<ContentColumn>, required: true },
})
const router = useRouter();
function goFilelist() {
    // remember the column to go
    localStorage.setItem("currentColumn", JSON.stringify(props.content));
    router.push({
        name: "filelist",
        params: {content: JSON.stringify(props.content)}
    });
};
</script>

<template>
    <li>
        <RouterLink v-if="!content.subColumn || content.subColumn.length==0"
        to="#" @click="goFilelist()">
            {{props.content.titleZh}}
        </RouterLink>
        <span v-if="content.subColumn && content.subColumn.length>0">{{props.content.titleZh}}</span>
    </li>
    <ul v-if="content.subColumn && content.subColumn.length>0">
        <li v-for="c in content.subColumn">
            <Column :content=c></Column>
        </li>
    </ul>
</template>
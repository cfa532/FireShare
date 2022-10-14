<script setup lang="ts">
import { PropType } from 'vue';
import { useRouter } from 'vue-router'
import { useMimei } from '../stores/lapi';
const props = defineProps({
    content: {type: Object as PropType<ContentColumn>, required: true },
})
const router = useRouter();
function goFilelist() {
    console.log(props.content)
    router.push({
        name: "filelist", params:{page:1, title:props.content.title}
    });
};
</script>

<template>
    <li class="columnList">
        <RouterLink v-if="!content.subColumn || content.subColumn.length==0"
        to="" @click.prevent="goFilelist()">
            {{props.content.titleZh}}
        </RouterLink>
        <span v-if="content.subColumn && content.subColumn.length>0">{{props.content.titleZh}}</span>
    </li>
    <ul v-if="content.subColumn && content.subColumn.length>0">
        <li class="columnList" v-for="c in content.subColumn">
            <Column :content=c></Column>
        </li>
    </ul>
</template>
<script setup lang="ts">
import { PropType, ref } from 'vue';

const props = defineProps({
    content: {type: Object as PropType<ContentColumn>, required: true }
})
</script>

<template>
    <li>{{props.content.titleZh}}</li>
    <ul v-if="content.subColumn && content.subColumn.length>0">
        <li v-for="c in content.subColumn">
            <Column :content=c></Column>
        </li>
    </ul>
</template>
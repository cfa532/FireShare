<script setup lang="ts">
import { PropType } from 'vue';
import { useRouter, useRoute } from 'vue-router'
import AppVue from '../App.vue';

const props = defineProps({
    content: {type: Object as PropType<ContentColumn>, required: true },
    app: Object
})
</script>

<template>
    <li>
        <RouterLink v-if="!content.subColumn || content.subColumn.length==0"
        :to="{
            name: 'filelist', query: content as any
        }">
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
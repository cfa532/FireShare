<script setup lang="ts">
import { PropType, onMounted } from 'vue';
import { useRouter } from 'vue-router'
// import { useLeither } from '../stores/lapi';
// const api = useLeither();
const props = defineProps({
    column: {type: Object as PropType<ContentColumn>, required: true },
})
const router = useRouter();

onMounted(()=>{
    // console.log("Column mounted", props)
})
function goFilelist() {
    router.push({
        name: "filelist", params:{page: 1, title: props.column.title}
    });
};
</script>

<template>
    <li class="columnList">
        <RouterLink v-if="!column.subColumn || column.subColumn.length==0"
        to="" @click.prevent="goFilelist()">
            {{props.column.titleZh}}
        </RouterLink>
        <span v-if="column.subColumn && column.subColumn.length>0">{{props.column.titleZh}}</span>
    </li>
    <ul v-if="column.subColumn && column.subColumn.length>0">
        <Column v-for="c in column.subColumn" :column=c></Column>
    </ul>
</template>
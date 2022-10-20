<script setup lang="ts">
import { onMounted, PropType } from 'vue';
import { useMimei } from "../stores/lapi";
const props = defineProps({
    column: {type: Object as PropType<ContentColumn>, required: true }
})
onMounted(()=>{
    console.log("Navibar", props.column)
})
</script>

<template>
<div style="margin-top: 40px;"></div>
<ul class="naviBar">
    <li><RouterLink active-class="active" :to="{name: 'main'}">众众</RouterLink></li>
    <li>--</li>
    <li><RouterLink class="active" :to="{name: 'filelist', params:{title: props.column.title}}">{{props.column.titleZh}}</RouterLink></li>
</ul>
</template>

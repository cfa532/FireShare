<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMimei, useLeither } from "../stores/lapi";
const props = defineProps({
    column: {type: String, required: true }
})
const api = useLeither()
const mmInfo = useMimei()
const col = ref<ContentColumn>({title:"News", titleZh:""});
onMounted(async ()=>{
    await mmInfo.init(api)
    col.value = await mmInfo.getColumn(props.column) as ContentColumn
    // console.log("Navibar mounted", props.column, col.value)
})
</script>

<template>
<div style="margin-top: 40px;"></div>
<ul class="naviBar">
    <li><RouterLink active-class="active" :to="{name: 'main'}">众众</RouterLink></li>
    <li>--</li>
    <li><RouterLink class="active" :to="{name: 'filelist', params:{title: col.title}}">
        {{col.titleZh}}</RouterLink></li>
</ul>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useMimei, useLeither } from "../stores/lapi";
const props = defineProps({
    column: {type: String, required: true }
})
const api = useLeither()
const mmInfo = useMimei()
const title = ref("News")
const titleZh = ref("")
onMounted(async ()=>{
    await mmInfo.init(api)
    console.log("navibar mount", props.column)
    const col = await mmInfo.getColumn(props.column) as ContentColumn
    title.value = col.title
    titleZh.value = col.titleZh
    console.log("Navibar mounted", props.column, col)
})
</script>

<template>
<div style="margin-top: 40px;"></div>
<ul class="naviBar">
    <li><RouterLink active-class="active" :to="{name: 'main'}">众众</RouterLink></li>
    <li>--</li>
    <li><RouterLink class="active" :to="{name: 'filelist', params:{title: title}}">
        {{titleZh}}</RouterLink></li>
</ul>
</template>

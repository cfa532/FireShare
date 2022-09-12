<script setup lang="ts">

const props = defineProps({
    column: {type: String, required: true }
})
</script>

<template>
<div style="margin-top: 40px;"></div>
<ul class="naviBar">
    <li><RouterLink active-class="active" :to="{name: 'main'}">众众</RouterLink></li>
    <li>--</li>
    <li><RouterLink class="active" :to="{name: 'filelist'}">{{props.column}}</RouterLink></li>
</ul>
</template>

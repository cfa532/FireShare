<script setup lang="ts">
import { PropType } from 'vue';

const props = defineProps({
    column: {type: String, required: true }
})
</script>

<template>
<table cellspacing="0" cellpadding="8" width="100%">
    <tbody>
        <tr>
            <td bgcolor="#FFFFFF">
                <b><RouterLink :to="{name: 'main'}">人人为我 我为人人</RouterLink> -&gt; 
                <RouterLink :to="{name: 'filelist'}">{{props.column}}</RouterLink></b>
            </td>
            <td bgcolor="#FFFFFF" align="right"><b><a href="#">登录</a> -&gt; <a href="#">注册</a></b>
            </td>
        </tr>
    </tbody>
</table>
</template>

<style>
</style>
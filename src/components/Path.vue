<script setup lang="ts">
import { PropType } from 'vue';

const props = defineProps({
    content: {type: Object as PropType<ContentColumn>, required: true }
})
</script>

<template>
<table cellspacing="0" cellpadding="8" width="100%">
    <tbody>
        <tr>
            <td bgcolor="#FFFFFF">
                <b><a href="/">人人为我 我为人人</a> -&gt; <a href="simple/?f280.html">国产精选</a></b>
            </td>
            <td bgcolor="#FFFFFF" align="right"><b><a href="#">登录</a> -&gt; <a href="#">注册</a></b>
            </td>
        </tr>
    </tbody>
</table>
</template>
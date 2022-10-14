<script setup lang="ts">
import ColumnVue from "./Column.vue";
import { useMimei } from "../stores/lapi"

const mmInfo = useMimei();
const titleZh = "众众";
</script>

<template>
    <div style="margin-top: 40px;"></div>
    <ul class="naviBar">
        <li><RouterLink active-class="active" :to="{name: 'main'}">{{titleZh}}</RouterLink></li>
    </ul>
    <ul>
        <li v-for="(c, i) in mmInfo.naviColumnTree" :key="i">
            <column-vue :content=c></column-vue>
        </li>
    </ul>
</template>
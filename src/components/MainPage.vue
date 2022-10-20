<script setup lang="ts">
import { ref } from "vue";
import ColumnVue from "./Column.vue";
import { useMimei, useLeither } from "../stores/lapi"
import { onMounted } from "vue";
import { computed } from "@vue/reactivity";

const api = useLeither();
const mmInfo = useMimei();
const titleZh = "众众";
const contentColumn = ref()

onMounted(async ()=>{
    await mmInfo.init(api)
    console.log("main page mounted", mmInfo.$state)
    contentColumn.value = await mmInfo.naviColumnTree
})


</script>

<template>
    <div style="margin-top: 40px;"></div>
    <ul class="naviBar">
        <li><RouterLink active-class="active" :to="{name: 'main'}">{{titleZh}}</RouterLink></li>
    </ul>
    <ul>
        <li v-for="(c, i) in contentColumn" :key="i">
            <column-vue :content=c></column-vue>
        </li>
    </ul>
</template>
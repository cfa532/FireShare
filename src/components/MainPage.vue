<script setup lang="ts">
import { ref } from "vue";
import ColumnVue from "./Column.vue";
import { useMimei, useLeither } from "../stores/lapi"
import { onMounted } from "vue";

const api = useLeither();
const mmInfo = useMimei();
const contentColumn = ref()
const titleZh = "众众";

onMounted(async ()=>{
    console.log("main page mounted", mmInfo.$state)
    try {
        await mmInfo.init(api)
        contentColumn.value = await mmInfo.naviColumnTree
    } catch(e) {
        console.error(e)
    }
})


</script>

<template>
    <div style="margin-top: 40px;"></div>
    <ul class="naviBar">
        <li><RouterLink active-class="active" :to="{name: 'main'}">{{titleZh}}</RouterLink></li>
    </ul>
    <ul>
        <li v-for="(c, i) in contentColumn" :key="i">
            <column-vue :column=c></column-vue>
        </li>
    </ul>
</template>
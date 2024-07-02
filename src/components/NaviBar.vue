<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter, useRoute } from "vue-router";
import { useMimei, useLeither } from "../stores/lapi";
const router = useRouter()
const route = useRoute()
const api = useLeither()
const mmInfo = useMimei()
const col = ref(true);     // placeholder because of async mounted()

const rootClass = computed(()=>{
    return col.value? "nav-link" : "nav-link active"
})
const delClass = computed(()=>{
    return !col.value? "nav-link" : "nav-link active"
})
</script>

<template>
<!-- <div style="margin-top: 40px; width:100%"></div> -->
<ul class="nav nav-tabs">
    <li class="nav-item">
        <RouterLink @click="col=false" :class=rootClass :to="{name: 'main'}">发布</RouterLink>
    </li>
    <li class="nav-item">
        <RouterLink @click="col=true" :class=delClass :to="{name: 'delPost'}">删除</RouterLink>
    </li>
</ul>
</template>

<style>
</style>
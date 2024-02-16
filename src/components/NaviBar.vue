<script setup lang="ts">
import { onMounted, ref, computed, watch } from 'vue';
import { useRouter, useRoute } from "vue-router";
import { useMimei, useLeither } from "../stores/lapi";
const router = useRouter()
const route = useRoute()
const props = defineProps({
    column: {type: String, required: false }
})
const api = useLeither()
const mmInfo = useMimei()
const col = ref<ContentColumn>();     // placeholder because of async mounted()
const txtLogin = ref("Login")

onMounted(async ()=>{
    // await mmInfo.init(api)
    if (props.column)
        col.value = await mmInfo.getColumn(props.column) as ContentColumn
    console.log("Navibar mounted", props.column, col.value)
    txtLogin.value = api.sid? "Logout" : "Login";
})
const rootClass = computed(()=>{
    return col.value? "nav-link" : "nav-link active"
})
watch(()=>route.params.title, async (cv, pv)=>{
    if (cv != pv) {
        col.value = props.column? await mmInfo.getColumn(props.column) as ContentColumn : undefined
        txtLogin.value = api.sid? "Logout" : "Login";
    }
})
function logout() {
    if (api.sid) {
        api.logout();
    } else {
        api.returnUrl = window.location.hash;
        router.push({name: "login"});
    }
}
</script>

<template>
<!-- <div style="margin-top: 40px; width:100%"></div> -->
<ul class="nav nav-tabs">
    <li class="nav-item">
        <RouterLink :class=rootClass :to="{name: 'main'}">众众</RouterLink>
    </li>
    <li v-if="col" class="nav-item">
        <RouterLink :class=rootClass aria-current="page" :to="{name: 'filelist', params:{title: col.title}}">{{col.titleZh}}</RouterLink>
    </li>
    <li v-if="col" class="nav-itme" style="position:absolute; right: 0;" id="login">
        <RouterLink class="nav-link" @click.prevent="logout" to="logout">{{txtLogin}}</RouterLink>
    </li>
</ul>
</template>

<style>
</style>
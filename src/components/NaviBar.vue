<script setup lang="ts">
import { onMounted, ref, computed } from 'vue';
import { useRouter } from "vue-router";
import { useMimei, useLeither } from "../stores/lapi";
const router = useRouter()
const props = defineProps({
    column: {type: String, required: true }
})
const api = useLeither()
const mmInfo = useMimei()
const col = ref<ContentColumn>({title:"News", titleZh:""});     // placeholder because of async mounted()
const txtLogin = ref("Login")

onMounted(async ()=>{
    await mmInfo.init(api)
    col.value = await mmInfo.getColumn(props.column) as ContentColumn
    console.log("Navibar mounted", props.column, col.value)
    txtLogin.value = api.sid? "Logout" : "Login";
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
<div style="margin-top: 40px; width:100%"></div>
<ul class="naviBar">
    <li><RouterLink active-class="active" :to="{name: 'main'}">众众</RouterLink></li>
    <li>--</li>
    <li><RouterLink class="active" :to="{name: 'filelist', params:{title: col.title}}">
        {{col.titleZh}}</RouterLink>
    </li>
    <li id="login"><RouterLink @click.prevent="logout" to="/">{{txtLogin}}</RouterLink></li>
</ul>
</template>

<style>
</style>
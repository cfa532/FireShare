<script setup lang="ts">
import { computed, onBeforeMount, onMounted, ref, watch } from "vue";
import { useLeither, useMimei } from '../stores/lapi';
import { useRoute, useRouter } from "vue-router";
const api = useLeither();
const router = useRouter()
const usr = ref()
const psd = ref()
async function login() {
    try {
        await api.login(usr.value, psd.value);
    } catch(err) {
        console.error(err)
        alert("Login failed.")
    }
}
onMounted(()=>{
    console.log("login mounted")
})
</script>

<template>
<div style="margin-top: 40px;"></div>
    <ul class="naviBar">
        <li><RouterLink class="active" :to="{name: 'main'}">众众</RouterLink></li>
    </ul>

<form @submit.prevent="login">
    <label for="fname">User name:</label><br>
    <input type="text" v-model="usr" name="usr" autocomplete="username"><br>
    <label for="lname">Password:</label><br>
    <input type="password" v-model="psd" name="pass" autocomplete="current-password">
    <p></p>
    <input type="submit" value="Submit">
</form>
</template>
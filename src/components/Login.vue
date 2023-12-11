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
        let returnUrl = await api.login(usr.value, psd.value);
        router.push(returnUrl)
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
<div style="margin-top: 10px; position:absolute; right: 40px;">
<form @submit.prevent="login">
    <label for="fname">User name:</label><br>
    <input type="text" v-model="usr" name="usr" autocomplete="username"><br>
    <label for="lname">Password:</label><br>
    <input type="password" v-model="psd" name="pass" autocomplete="current-password">
    <p></p>
    <input type="submit" value="Submit">
</form>
</div>
</template>
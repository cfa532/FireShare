<script setup lang="ts">
import { onMounted, ref } from "vue";
import { useLeither, useSpinner } from '../stores/lapi';
import { Spinner } from '../components/index'
// import { useRouter } from "vue-router";
const api = useLeither();
// const router = useRouter()
const usr = ref()
const psd = ref()
async function login() {
    try {
        console.log(api.returnUrl)
        api.login(usr.value.trim(), psd.value.trim());
        // router.push(returnUrl)
    } catch(err) {
        console.error(err)
        alert("Login failed.")
    }
}
</script>

<template>
<div style="margin-top: 10px; position:absolute; right: 40px;">
    <Spinner :active="useSpinner().loading" text="Please wait......"/>
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
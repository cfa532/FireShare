<script setup lang="ts">
import { ref, onMounted, nextTick, computed } from "vue";
import ColumnVue from "./Column.vue";
import MsgVue from "./Msg.vue";
import { useMimei, useLeither } from "../stores/lapi"

const api = useLeither();
const mmInfo = useMimei();
const contentColumn = ref<ContentColumn[]>([])
const msg = ref();
onMounted(async ()=>{
    try {
        await mmInfo.init(api)
        contentColumn.value = await mmInfo.naviColumnTree
        console.log("main page mounted", mmInfo.$state)
        // msg.value = JSON.stringify(mmInfo.$state)
        if (window.getParam) {
            let p=window.getParam()
            msg.value = "Resource data provided by:" + p["ips"][p.CurNode] + " from Providers: " + p.ips
        }
    } catch(e) {
        console.error(e)
        // the error is often caused by expired sid, try logout
        msg.value = JSON.stringify(e)
        nextTick(()=>{msg.value = JSON.stringify(mmInfo.$state)})
        api.logout();
    }
})
function showWebdav() {
    // hide local Webdav if not login
    return contentColumn.value!.filter((e)=>{
        let l =  e.title==="Webdav";
        return l? l && api.sid : true;
    })
}
</script>

<template>
    <!-- push content down to not overlap with horizontal navi bar -->
    <div style="margin-top: 40px;"></div>
    <ul class="naviBar">
        <li><RouterLink active-class="active" :to="{name: 'main'}">众众</RouterLink></li>
    </ul>
    <ul class="top">
        <column-vue v-for="(c, i) in contentColumn" :key="i" :column=c></column-vue>
    </ul>
    <MsgVue :msg="msg"></MsgVue>
</template>

<style>
ul.naviBar {
  display: table;
  list-style-type: none;
  background-color: antiquewhite;
  overflow: hidden;
  margin: 0px 0px 10px 0px;
  padding: 0px 0px 0px 20px;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 32px;
}
ul.naviBar li {
  display: inline-block;
  color: rgb(132, 181, 32);
  text-align: center;
  padding: 0px 5px;
  margin: 0px;
}
ul.naviBar li#login {
    display: inline-block;
    position: fixed;
    right: 0;
    color: rgb(132, 181, 32);
    text-align: center;
    padding: 0px 5px;
    margin-right: 5px;
    margin-top:6px;
}
ul.naviBar li a.active {
    display: block;
    background-color: #04aa6d;
    color:aliceblue;
    padding: 5px;
}

ul.top {
  list-style-type: none;
  overflow: hidden;
  margin: 0px 0px 0px -20px;
  width: 200px;
}
ul.top li {
  margin: 10px 0px 0px 0px;
}
ul.top li a {
  display: inline-block;
  width: 200px;
  background-color:rgb(220, 247, 202);
}
ul.top li a::before {
  content:"• ";
}
</style>
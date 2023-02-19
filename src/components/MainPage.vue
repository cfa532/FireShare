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
    <div style="margin-top: 40px;"></div>
    <ul class="naviBar">
        <li><RouterLink active-class="active" :to="{name: 'main'}">众众</RouterLink></li>
    </ul>
    <ul>
        <column-vue v-for="(c, i) in contentColumn" :key="i" :column=c></column-vue>
    </ul>
    <MsgVue :msg="msg"></MsgVue>
</template>
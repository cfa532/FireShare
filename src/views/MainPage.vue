<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Column } from "../components/index";
import { useMimei, useLeither } from "../stores/lapi"

const api = useLeither();
const mmInfo = useMimei();
const contentColumn = ref<ContentColumn[]>([])
onMounted(async ()=>{
  document.title = import.meta.env.VITE_PAGE_TITLE
  try {
      // await mmInfo.init(api)
      contentColumn.value = await mmInfo.naviColumnTree
      console.log("main page mounted", mmInfo.$state, api.$state)
      // msg.value = JSON.stringify(mmInfo.$state)
  } catch(e) {
      console.error(e)
      // the error is often caused by expired sid, try logout
      // msg.value = JSON.stringify(e)
      // nextTick(()=>{msg.value = JSON.stringify(mmInfo.$state)})
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
    <ul class="top">
        <Column v-for="(c, i) in contentColumn" :key="i" :column=c></Column>
    </ul>
</template>

<style>
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
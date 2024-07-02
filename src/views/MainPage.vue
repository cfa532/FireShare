<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Column, EditorModal } from "../components/index";
import { useMimei, useLeither } from "../stores/lapi"

const api = useLeither();
const mmInfo = useMimei();
const contentColumn = ref<ContentColumn[]>([])
const columnTitle = ref('Pictures')

onMounted(async ()=>{
  document.title = import.meta.env.VITE_PAGE_TITLE
  try {
      // await mmInfo.init(api)
      contentColumn.value = mmInfo.naviColumnTree
      var dbMMVer = await api.client.Getvar(api.sid, "mmversions", import.meta.env.VITE_MIMEI_DB)
      console.warn("main.ts built....on " + __BUILD_TIME__, "ver:"+import.meta.env.VITE_APP_VERSION, dbMMVer)
      console.log("main page mounted", mmInfo.$state, api.$state)
      // msg.value = JSON.stringify(mmInfo.$state)
  } catch(e) {
      console.error(e)
      // the error is often caused by expired sid, try logout
      // msg.value = JSON.stringify(e)
      // nextTick(()=>{msg.value = JSON.stringify(mmInfo.$state)})
      api.logout({name: "main"});
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
    <div class='container-fluid'>
        <div class='row'>
            <div class='col-2'>
                <Column @selected-column="id => columnTitle = id" v-for='(c, i) in contentColumn' :key='i' :column=c>
                </Column>
            </div>
            <div class='col-10'>
                <EditorModal :column='columnTitle'></EditorModal>
            </div>
        </div>
    </div>
</template>

<style>
.container-fluid {
  height: 100vh;
  /* Ensure the container takes the full height of the viewport */
}
.row {
  display: flex;
  align-items: flex-start;
  /* Align items to the top */
  height: 100%;
  /* Ensure the row takes the full height of the container */
}

.col-2 {
  width: 160px;
}

.col-10 {
  margin: -0px 0 0 0;
  /* Remove any margin that might affect alignment */
  width: 80%;
  padding: 0;
  /* Remove any padding that might affect alignment */
  display: flex;
  flex-direction: column;
  /* Ensure the content inside col-10 is aligned to the top */
}
</style>
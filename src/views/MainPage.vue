<script setup lang="ts">
import { ref, onMounted } from "vue";
import { Column, EditorModal } from "../components/index";
import { useMimei, useLeither } from "../stores/lapi"

const api = useLeither();
const mmInfo = useMimei();
const contentColumn = ref<ContentColumn[]>([])
const columnTitle = ref('Pictures')
const mySidenav = ref<HTMLDivElement>()
const btnOpen = ref<HTMLSpanElement>()

onMounted(async ()=>{
  document.title = import.meta.env.VITE_PAGE_TITLE
  try {
      // await mmInfo.init(api)
      contentColumn.value = mmInfo.naviColumnTree
      var dbMMVer = await api.client.Getvar(api.sid, "mmversions", import.meta.env.VITE_MIMEI_DB)
      console.info("main.ts built....on " + __BUILD_TIME__, "ver:"+import.meta.env.VITE_APP_VERSION, dbMMVer)
      console.log("main page mounted", mmInfo.$state, api.$state)
  } catch(e) {
      console.error(e)
  }
})
function openNav() {
    mySidenav.value!.style.width = "160px";
    mySidenav.value!.style.paddingLeft = "5px"
    mySidenav.value!.style.height = "auto"
    btnOpen.value!.hidden = true
}
function closeNav() {
    console.log("close bar")
    mySidenav.value!.style.width = "0";
    mySidenav.value!.style.height = "0"
    mySidenav.value!.style.paddingLeft = "0"
    btnOpen.value!.hidden = false
}
</script>

<template>
    <!-- push content down to not overlap with horizontal navi bar -->
    <div class='container-fluid'>
        <div class='row'>
            <span ref="btnOpen" hidden style="font-size:24px; cursor:pointer; position:fixed; margin-top:-10px; padding-top: 0px;" @click="openNav()"> &#9776; </span>
            <div class='sidenav' ref="mySidenav">
              <a href="javascript:void(0)" class="closebtn" @click="closeNav()">&times;</a>
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

.col-10 {
  padding-top: 30px;
  max-width: 900px
}
.sidenav {
    overflow: hidden;
    width: 160px;
    /* max-width: 160px; */
    top: 0px;
    left: 0;
    /* background-color:rgb(246, 244, 240); */
    transition: 0.5s;
    padding-top: 0px;
    /* hide Open button */
    padding-left: 5px;
    /* padding-right: 5px; */
}

.sidenav .closebtn {
    top: 0px;
    right: 25px;
    font-size: 30px;
    margin-left: 50px;
    text-decoration: none;
}
@media screen and (max-height: 450px) {
    .sidenav {
        padding-top: 15px;
    }
}

@media screen and (min-width: 600px) {
    .sidenav {
        max-width: 160px;
        /* Or whatever width you want. */
    }

    .sidenav .closebtn {
        font-size: 0px;
    }
}

</style>
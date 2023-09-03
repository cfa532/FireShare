<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import Manager from './components/Manager.vue'
import { useRoute } from 'vue-router'
import NaviBar from './components/NaviBar.vue';
const route = useRoute()
</script>

<template>
<div class="container-fluid">
    <div class="row justify-content-start">
      <div class="col">
        <NaviBar :column="(route.params.title as string)"></NaviBar>
        <router-view></router-view>
      </div>
    </div>
</div>
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
</style>
<script setup lang="ts">

const props = defineProps({
    column: {type: String, required: true }
})
</script>

<style>
ul.naviBar {
    list-style-type: none;
    background-color: antiquewhite;
    overflow: hidden;
    margin: 0px 0px 10px 0px;
    padding: 0px 0px;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
}
ul.naviBar li {
    display: inline-block;
    color: rgb(132, 181, 32);
    text-align: center;
    padding: 0px 5px;
    margin: 0px;
}
ul.naviBar li a.active {
    display: block;
    background-color: #04aa6d;
    color:aliceblue;
    padding: 5px
}
/* li.naviBar {
    display: inline-block;
    list-style-type: none;
    margin: 0px;
    padding: 0px;
} */
</style>

<template>
<div style="margin-top: 40px;"></div>
<ul class="naviBar">
    <li><RouterLink active-class="active" :to="{name: 'main'}">众众</RouterLink></li>
    <li>--</li>
    <li><RouterLink active-class="active" :to="{name: 'filelist'}">{{props.column}}</RouterLink></li>
</ul>
<!-- <table cellspacing="0" cellpadding="8" width="100%">
    <tbody>
        <tr>
            <td bgcolor="#FFFFFF">
                <b><RouterLink :to="{name: 'main'}">人人为我 我为人人</RouterLink> -&gt; 
                <RouterLink :to="{name: 'filelist'}">{{props.column}}</RouterLink></b>
            </td>
            <td bgcolor="#FFFFFF" align="right"><b><a href="#">登录</a> -&gt; <a href="#">注册</a></b>
            </td>
        </tr>
    </tbody>
</table> -->
</template>

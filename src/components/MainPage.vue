<script setup lang="ts">
import ColumnVue from "./Column.vue";

// export typeof Column
// const c0: ContentColumn = {title: "Root", titleZh: "众众", orderBy:0}
const c0: ContentColumn[] = [
    {title:"News", titleZh:"最新文档", orderBy:0}, 
    {title:"Pictures", titleZh:"图片专区", orderBy:1, subColumn: [
        {title:"Western", titleZh:"洋画", orderBy:0},
        {title:"Japan", titleZh:"邦画", orderBy:0},
    ]},
    {title:"Webdav", titleZh:"本地文档", orderBy:2}
];
const titleZh = "众众";
</script>

<template>
    <div style="margin-top: 40px;"></div>
    <ul class="naviBar">
        <li><RouterLink active-class="active" :to="{name: 'main'}">{{titleZh}}</RouterLink></li>
    </ul>
    <ul>
        <li v-for="c in c0">
            <column-vue :content=c></column-vue>
        </li>
    </ul>
</template>
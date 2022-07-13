<script setup lang="ts">
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://vuejs.org/api/sfc-script-setup.html#script-setup
// import Manager from './components/Manager.vue'
import Column from './components/Column.vue'

// export typeof Column
const c0: ContentColumn = {title: "Root", titleZh: "总版", orderBy:0}
c0.subColumn = [
    {title:"News", titleZh:"最新文档", orderBy:0}, 
    {title:"Pictures", titleZh:"图片专区", orderBy:1, subColumn: [
        {title:"Western", titleZh:"洋画", orderBy:0},
        {title:"Japan", titleZh:"邦画", orderBy:0},
    ]}
];
</script>

<template>
  <!-- <img alt="Vue logo" src="logo.png" style="width: 50px;"/> -->
<table cellspacing="1" cellpadding="7" width="100%" class="i_table" align="center">
<tbody>
    <tr>
        <td bgcolor="#FFFFFF">
            <h2>{{c0.titleZh}}</h2>
            <ul>
                <li v-for="c in c0.subColumn">
                    <column :content=c></column>
                </li>
            </ul>
        </td>
    </tr>
</tbody>
</table>
</template>
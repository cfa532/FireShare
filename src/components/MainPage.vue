<script setup lang="ts">
import { ref, onMounted, PropType} from "vue";
import { routerKey, useRouter } from "vue-router";
import ColumnVue from "./Column.vue";

// export typeof Column
const c0: ContentColumn = {title: "Root", titleZh: "众众", orderBy:0}
c0.subColumn = [
    {title:"News", titleZh:"最新文档", orderBy:0}, 
    {title:"Pictures", titleZh:"图片专区", orderBy:1, subColumn: [
        {title:"Western", titleZh:"洋画", orderBy:0},
        {title:"Japan", titleZh:"邦画", orderBy:0},
    ]}
];

</script>

<template>
<table cellspacing="1" cellpadding="7" width="100%" align="center">
<tbody>
    <tr>
        <td bgcolor="#FFFFFF">
            <h3>{{c0.titleZh}}</h3>
            <ul>
                <li v-for="c in c0.subColumn">
                    <column-vue :content=c></column-vue>
                </li>
            </ul>
        </td>
    </tr>
</tbody>
</table>

</template>
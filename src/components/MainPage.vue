<script setup lang="ts">
import { ref, onMounted, PropType} from "vue";

const naviPath = [];        // if len=0, root page; if len=1, first sub column,.... 

const props = defineProps({
    content: {type: Object as PropType<ContentColumn>, required: true }
})
onMounted(()=>{
    console.log(props.content)
})
</script>

<template>
  <!-- <img alt="Vue logo" src="logo.png" style="width: 50px;"/> -->
<table cellspacing="1" cellpadding="7" width="100%" class="i_table" align="center">
<tbody>
    <tr>
        <td bgcolor="#FFFFFF">
            <h2>{{content.titleZh}}</h2>
            <ul>
                <li v-for="c in content.subColumn">
                    <column :content=c></column>
                </li>
            </ul>
        </td>
    </tr>
</tbody>
</table>
</template>
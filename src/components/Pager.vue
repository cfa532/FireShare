<script setup lang="ts">
import { reactive, onMounted, CSSProperties, computed } from "vue";

// display pages of item list
const props = defineProps({
    currentPage: {type:Number, required: false, default:1},
    pageSize: {type:Number, required: false, default:30},
    itemNumber: {type:Number, required: true},
})
const curClass = reactive<CSSProperties>({
    display: 'inline-block',
    "background-color": "red",
})
// page number starts at 1, display links to 5 pages on either side
const firstPage = computed(():number=>{
    return Math.max(props.currentPage-5, 1)
})
const lastPage = computed(():number=>{
    return Math.min(props.currentPage+6, Math.ceil(props.itemNumber/props.pageSize))
})
onMounted(()=>{
    console.log("Pager mounted", props)
})
const emit = defineEmits(["pageChanged"])
function naviPage(n: number) {
    if (n===props.currentPage) return
    if (n<1) n=1
    else if (n>Math.ceil(props.itemNumber/props.pageSize))
        n=Math.ceil(props.itemNumber/props.pageSize)
        
    // self.dispatchEvent(new CustomEvent('pageChanged', {detail:{'page':n}, bubbles:true, composed:true}))
    emit("pageChanged", n)
}
</script>

<template>
    <hr />
<div style="margin-top: 20px;">
<table width="80%">
    <tr align="left">
        <td style="width: 50px">
            <a href="" @click.prevent="naviPage(1)"><strong>&#8810;</strong>first</a>
        </td>
        <td style="width: 20px">
            <a href="" @click.prevent="naviPage(props.currentPage-1)">&lt;</a>
        </td>
        <td style="width:20px;" v-for="n in (lastPage-firstPage+1)">
            <a href="" @click.prevent="naviPage(n+firstPage-1)" 
                :style="n+firstPage-1===props.currentPage?curClass:{}">{{n+firstPage-1}}
            </a>
        </td>
        <td style="width: 20px">
            <a href="" @click.prevent="naviPage(props.currentPage+1)">&gt;</a>
        </td>
        <td style="width: 50px">
            <a href="" @click.prevent="naviPage(Math.ceil(props.itemNumber/props.pageSize))">last<strong>&#8811;</strong></a>
        </td>
        <td></td>
    </tr>
</table>
</div>
</template>

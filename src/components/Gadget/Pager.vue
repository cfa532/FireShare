<script setup lang="ts">
import { reactive, onMounted, CSSProperties, computed } from "vue";
const props = defineProps({
    currentPage: {type:Number, required: false, default:1},
    pageSize: {type:Number, required: false, default:10},
    itemNumber: {type:Number, required: true},
})
// const curClass = reactive<CSSProperties>({
//     display: 'inline-block',
//     "background-color": "red",
// })
const curClass = computed((n)=>{
    console.log(n)
    return {
        display: 'inline-block',
        "background-color": "red",
    }
})
const emit = defineEmits(["pageChanged"])
// page number starts at 1
const firstPage = computed(():number=>{
    return Math.max(props.currentPage-5, 1)
})
const lastPage = computed(():number=>{
    return Math.min(props.currentPage+6, Math.ceil(props.itemNumber/props.pageSize))
})
onMounted(()=>{
    console.log(firstPage.value, lastPage.value)
})
function naviPage(n: number) {
    if (n===props.currentPage) return
    if (n<1) n=1
    else if (n>Math.ceil(props.itemNumber/props.pageSize))
        n=Math.ceil(props.itemNumber/props.pageSize)
    console.log("Go to page", n, firstPage.value, lastPage.value)
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
        <td style="width: 20px" v-for="n in (lastPage-firstPage+1)">
            <a href="" @click.prevent="naviPage(n+firstPage-1)" :style="n+firstPage-1===props.currentPage?{'background-color':'red'}:{}">
            {{n+firstPage-1}}</a>
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

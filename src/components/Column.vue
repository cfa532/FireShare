<script setup lang="ts">
import { PropType, onMounted } from 'vue';
import { useRouter } from 'vue-router'
// import { useLeither } from '../stores/lapi';
// const api = useLeither();
const props = defineProps({
    column: {type: Object as PropType<ContentColumn>, required: true },
})
const emits = defineEmits(["selectedColumn"])

onMounted(()=>{
    // console.log("Column mounted", props)
})
</script>

<template>
    <li>
      <span v-if="!column.subColumn || column.subColumn.length == 0"  @click.prevent="emits('selectedColumn', props.column.title)">
        {{props.column.titleZh}}</span>
      <span v-else>{{ props.column.titleZh }}</span>
    </li>
    <ul class="columnList" v-if="column.subColumn && column.subColumn.length>0">
        <Column @selected-column="id => emits('selectedColumn', id)" v-for="c in column.subColumn" :column=c :key="c.title"></Column>
    </ul>
</template>

<style>
li {
  font-size: 1.0rem;
}
ul.columnList {
  list-style-type: none;
  font-size: 1.0rem;
}
ul.columnList li {
  margin: 5px 0px 0px 0px;
  text-align: left;
}
ul.columnList li a {
  background-color: rgb(220, 247, 202);
  text-align: left;
}
li:hover {
  background-color: rgb(220, 247, 202);
  cursor: pointer;
}
</style>
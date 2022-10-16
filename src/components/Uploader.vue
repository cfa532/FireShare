<script setup lang="ts">
import { onMounted, ref } from "vue";
import EditorModal from "./EditorModal.vue";

const emit = defineEmits(["uploaded"])
const showEditor = ref("none")
onMounted(() => {
  // remember user input even after a page refresh. It is cleared only after submit
})
function showModal(e: MouseEvent) {
  // show modal box
  showEditor.value = "block"
};
function uploaded(fi: FVPair) {
  showEditor.value = "none"
  emit('uploaded', fi);
}
function hide() {
  showEditor.value = "none"
}
</script>

<template>
  <div class="postbox">
    <p @click="showModal" class="postbox">Tell us what is happening....</p>
  </div>
  <EditorModal @uploaded="uploaded" @hide="hide" :display="showEditor"></EditorModal>
</template>

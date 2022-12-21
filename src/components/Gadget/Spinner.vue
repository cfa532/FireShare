<template>
    <div v-if="active" class="loader-wrapper">
      <div class="loader">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <p>{{ text }}</p>
    </div>
  </template>
  
  <script lang="ts">
  export default {
    name: 'Loader',
    props: {
      active: Boolean,
      text: String
    }
  }
  </script>
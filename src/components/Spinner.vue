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
      text: {
        type: String, required: false, default: "Please wait....."
      }
    }
  }
  </script>
  <style>
.loader-wrapper {
      position: fixed;
      z-index: 9999;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(255, 255, 255, 0.3);
      text-align: center;
    }
  
    .loader {
      display: inline-block;
      position: relative;
      width: 80px;
      height: 80px;
    }
    .loader div {
      box-sizing: border-box;
      display: block;
      position: absolute;
      width: 64px;
      height: 64px;
      margin: 8px;
      border: 8px solid #6916a0;
      border-radius: 50%;
      animation: loader 1.2s cubic-bezier(0.5, 0, 0.5, 1) infinite;
      border-color: #6916a0 transparent transparent transparent;
    }
    .loader div:nth-child(1) {
      animation-delay: -0.45s;
    }
    .loader div:nth-child(2) {
      animation-delay: -0.3s;
    }
    .loader div:nth-child(3) {
      animation-delay: -0.15s;
    }
    @keyframes loader {
      0% {
        transform: rotate(0deg);
      }
      100% {
        transform: rotate(360deg);
      }
    }

</style>
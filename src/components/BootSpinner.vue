<template>
    <div v-if="visible" class="spinner-border text-primary" role="status">
      <span class="loader">Loading...</span>
    </div>
  </template>

  <script>
  export default {
    props: {
      visible: {
        type: Boolean,
        default: false
      }
    }
  };
  </script>

  <style scoped>
  .loader {
        border: 16px solid #f3f3f3;
        border-radius: 50%;
        border-top: 16px solid #3498db;
        width: 120px;
        height: 120px;
        animation: spin 2s linear infinite;
        display: none; /* Initially hidden */
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
  </style>
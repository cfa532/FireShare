import { createApp } from 'vue'
import App from './App.vue'

import { lapi } from './auth.js'

console.log("first lapi=", lapi)
setTimeout(()=>{
    createApp(App).mount('#app')
}, 500)

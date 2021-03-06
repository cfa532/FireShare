import { createApp } from 'vue';
import App from './App.vue';
import { getLocalApiHandler } from './auth.js';
getLocalApiHandler().then((api) => {
    // window.lapi = api
    let app = createApp(App);
    app.provide("lapi", api); // global Leither apiHandler
    app.config.unwrapInjectedRef = true; // temp setting until ver 3.3
    app.mount("#app");
});
//# sourceMappingURL=main.js.map
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { router } from './router'
import App from './App.vue';

const app = createApp(App)
const pinia = createPinia()
app.use(pinia)
app.use(router)
import { useLeither } from './stores/lapi';

app.config.errorHandler = (err, instance, info) => {
    // Handle the error globally
    console.error("Global error:", err);
    console.log("Vue instance:", instance);
    console.log("Error info:", info);

    sessionStorage.removeItem("sid")
}

console.warn("main.ts built....on " + __BUILD_TIME__, "ver:"+import.meta.env.VITE_APP_VERSION)
app.mount("#app")
// ids()

export async function ids() {
    // return the 
    let nodes = (import.meta.env.VITE_NODE_LIST as string).split(/\s*,\s*/)
    console.log(nodes)

    let ids:string[] = []
    const api = useLeither()
    nodes.forEach(async nid=>{
        ids.concat(await api.client.DhtFindPeer(nid))
    })
    ids = ids.filter(e=>!e.startsWith('192.168'))
    console.log(ids)

    let promises = ids.map(ip => sendRequest(ip).catch(error => console.error(error)));
    let timeoutPromise = new Promise((_, reject) => setTimeout(() => reject('Global timeout'), 5000)); // Global timeout
    promises.push(timeoutPromise);

    try {
        let firstRespondedIp = await Promise.race(promises);
        console.log(`First responded IP is: ${firstRespondedIp}`);
        return firstRespondedIp     // IP of the node to execute write operation
    } catch (error) {
        console.error(`No IP responded within the timeout period: ${error}`);
    }
}

// test availability of the ip
const sendRequest = (ip:string) => {
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', ip, true);
        xhr.timeout = 5000; // 5 seconds timeout

        xhr.ontimeout = () => reject(`Timeout for ${ip}`);
        xhr.onerror = () => reject(`Error in sending request to ${ip}`);
        xhr.onload = () => {
            if (xhr.status === 200) {
                resolve(ip);
            } else {
                reject(`Error ${xhr.status} for ${ip}`);
            }
        };
        xhr.send(null);
    });
};
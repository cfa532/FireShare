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

getIPtoWrite()

export function getIPtoWrite() {
    // return the 
    let nodes = (import.meta.env.VITE_NODE_LIST as string).split(/\s*,\s*/)
    console.log(nodes)

    let ids:string[] = []
    const api = useLeither()
    var firstRespondedIp = ""
    nodes.forEach(async nid=>{
        var n: AddrInfo = await api.client.DhtFindPeer(api.sid, nid)
        n.addrs.forEach(l => {
            var addr = l.split('/')
            var ip = addr[2]
            var port = addr[4]
            if (!ip.startsWith('192.168')) {
                console.log(ip+":"+port)
                sendRequest(ip+":"+port)
            }
        })
    })

    // test availability of the ip
    const sendRequest = (ip:string) => {
        let xhr = new XMLHttpRequest();
        xhr.open('GET', ip, true);
        xhr.timeout = 5000; // 5 seconds timeout

        xhr.onload = () => {
            if (xhr.status===200 && !firstRespondedIp) {
                firstRespondedIp = ip;
                console.log("firstRespondedIp=", ip)
            }
        };
        xhr.send(null);
    };
}
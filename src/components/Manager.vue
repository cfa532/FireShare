<script lang="ts">
// import Uploader from "./Uploader.vue"
// import FileList from "./FileList.vue"

import { stringifyStyle } from "@vue/shared";
import { defineComponent, provide } from "vue";
console.log("manager.js")  

declare global {
    interface Window {          //must be cap W
        lapi: any;
        getParam: any;
        hprose: any
    }
};

export default defineComponent({
    name: "Manager",
    components: {
    //     headnodestate, Uploader, FileList
    },
    data() {
        return {
            isLogined:true,
        }
    },
    methods: {
    },
    created() {
        const ayApi = ["GetVarByContext", "Act", "Login", "Getvar","Getnodeip", "SwarmLocal","DhtGetAllKeys",
            "DhtGet", "DhtGets", "SignPPT", "SwarmAddrs", "MFOpenTempFile", "MFTemp2MacFile", "MFSetData",
            "MFGetData", "MMCreate", "MMOpen", "Hset", "Hget", "Zadd", "Zrangebyscore", "Zrange", "MFOpenMacFile"]

        function getcurips(){
            //缺省的地址，用于本地调试程序
            let ips = "127.0.0.1:4800"
            //获取节点链接
            if (window.getParam != null){
                let p=window.getParam()
                console.log("p=", p)
                ips = p["ips"][p.CurNode]
                // hosturl = "ws://" + p["ips"][p.CurNode] + "/ws/"
                // baseurl = "http://" + p["ips"][p.CurNode] + "/"
            } else if (window.location.host != ""){
                ips = window.location.host
                // hosturl = "ws://" + window.location.host + "/ws/"
                // baseurl = "http://" +  window.location.host + "/"
            }
            { //for test
                ips = "192.168.1.104:4800"
            }
            // window.lapi.ips = ips
            return ips
        }

        let getLocalApiHandler = ()=>{
            let apiHandler: any = {};
            let ips = getcurips()
            apiHandler.ips = ips
            let hosturl = "ws://" + ips +"/ws/"
            let baseurl = "http://" + ips + "/"
            //生成操作句柄
            apiHandler.client = window.hprose.Client.create(hosturl, ayApi);

            //以上部分可以提取公用代码
            return apiHandler.client.GetVarByContext("", "ppt")
            .then((ppt:string)=>{
                showPPT(ppt)
                return apiHandler.client.Login(ppt)
                })
            .then((reply:any)=>{
                apiHandler.isLogined = true
                apiHandler.baseUrl = baseurl
                apiHandler.sid = reply.sid
                apiHandler.leitherid = reply.uid

                console.log("sid=", reply.sid)
                console.log("uid=", reply.uid)
                return apiHandler
                //查询应用            
                //showapps(sid)
                })
        }
        window.lapi = getLocalApiHandler()

        //读出通行证中的userid
        function showPPT(ppt: string){
            console.log("ppt=", ppt)
            var p = JSON.parse(ppt)
            // for (k in ppt){
            //     console.log("k=", k)        
            // }
            console.log("data=", p.Data)

        }
        // import("/src/auth.js").then((module) => {
        //     console.log("module", module);
        // })
        // var tag = document.createElement("script");
        // tag.setAttribute("src", "/src/auth.js");
        // tag.setAttribute("type", 'text/javascript');
        // document.head.appendChild(tag); 
    },
})
</script>
<template>
</template>
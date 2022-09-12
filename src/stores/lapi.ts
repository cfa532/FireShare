import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

const ayApi = ["GetVarByContext", "Act", "Login", "Getvar", "Getnodeip", "SwarmLocal", "DhtGetAllKeys","MFOpenByPath",
    "DhtGet", "DhtGets", "SignPPT", "RequestService", "SwarmAddrs", "MFOpenTempFile", "MFTemp2MacFile", "MFSetData",
    "MFGetData", "MMCreate", "MMOpen", "Hset", "Hget", "Zadd", "Zrangebyscore", "Zrange", "MFOpenMacFile","MFStat",
    "MFReaddir", "MFGetMimeType", "MFSetObject", "MFGetObject",
];

function getcurips(){
    //缺省的地址，用于本地调试程序
    let ips = "127.0.0.1:4800"
    //获取节点链接
    if (window.getParam != null){
        let p=window.getParam()
        ips = p["ips"][p.CurNode]
    } else if (window.location.host != ""){
        ips = window.location.host
    }
    { //for test
        ips = "192.168.1.101:4800"
    }
    return ips
}
    
export const useLeither = defineStore({
    id: 'LeitherApiHandler', 
    state: ()=>({
        sid: "",
        hostUrl: "",
        baseUrl: "",
    }),
    getters: {
        // console.log(state.hostUrl)
        client: (state) => window.hprose.Client.create(state.hostUrl, ayApi)
    },
    actions: {
        getLocalApiHandler() {
            let apiHandler: any = {};
            let ips = getcurips()
            let hosturl = "ws://" + ips +"/ws/"
            let baseurl = "http://" + ips + "/"
            //生成操作句柄
            apiHandler.client = window.hprose.Client.create(hosturl, ayApi);
        
            //以上部分可以提取公用代码
            return apiHandler.client.GetVarByContext("", "ppt")
            .then((ppt:string)=>{
                console.log("ppt=", ppt)
                console.log("data=", JSON.parse(ppt).Data)
                return apiHandler.client.Login(ppt)
                })
            .then((reply:any)=>{
                apiHandler.ips = ips
                apiHandler.isLogined = true
                apiHandler.baseUrl = baseurl
                apiHandler.sid = reply.sid
                apiHandler.leitherid = reply.uid
        
                console.log("sid=", reply.sid)
                console.log("uid=", reply.uid)
                console.log("apiHandler=", apiHandler)
                return apiHandler
                //查询应用            
                //showapps(sid)
            })
        },
        async login() {
            return new Promise((resolve)=>{
                let ips = getcurips()
                this.baseUrl = "http://" + ips + "/";
                this.hostUrl = "ws://" + ips + "/ws/";
                this.client.Login("lsb", "123456", "byname").then(
                    (result:any)=>{ 
                        this.sid = result.sid
                        this.client.SignPPT(this.sid, {
                            CertFor: "Self",
                            Userid: result.uid,
                            RequestService: "mimei"
                        }, 1).then(
                            (ppt:any)=>{
                            console.log("ppt=", JSON.parse(ppt))
                            this.client.RequestService(ppt).then(
                                (map:any)=>{
                                    console.log("Request service, ", map)
                                    resolve(true)
                                }, (err:Error)=>{
                                    console.error("Request service error=", err)
                                })
                        }, (err:Error)=>{
                            console.error("Sign PPT error=", err)
                        })
                    }, function(e:Error) {
                        console.error("Login error=", e)
                    }
                )
            })
            // try {
            //     //这是提前设置好的用户名密码，资源授权的情况下，可以使用guest帐号
            // } catch(error) {
            //     console.error("Login failed.", error)
            // }
        }
    }
})

export const useMimei = defineStore({
    id: 'MMInfo',
    state: ()=>({
        _mid: "",
        _mmsid: ""
    }),
    getters: {
        mid: (state) => {
            if (localStorage.getItem("mmInfo")) {
                state._mid = JSON.parse(localStorage.getItem("mmInfo")!)._mid
            }
            return state._mid;
        },
        mmsid: (state) => {
            if (localStorage.getItem("mmInfo")) {
                state._mmsid = JSON.parse(localStorage.getItem("mmInfo")!)._mmsid
            }
            return state._mmsid;
        },
    },
    actions: {
        downLoadByFileData(content:Uint8Array, fileName:string, mimeType:string) {
            var a = document.createElement("a");
            a.href = window.URL.createObjectURL(new Blob([content], {type: mimeType}));
            a.download = fileName.substring(fileName.lastIndexOf('/')+1);
            a.type =  mimeType;
            a.click();
            window.URL.revokeObjectURL(a.href);
        }
    // return { downLoadByFileData, mid, mmsid}
    }
})


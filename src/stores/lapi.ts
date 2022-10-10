import { defineStore } from 'pinia'
// Hprose API
const ayApi = ["GetVarByContext", "Act", "Login", "Getvar", "Getnodeip", "SwarmLocal", "DhtGetAllKeys","MFOpenByPath",
    "DhtGet", "DhtGets", "SignPPT", "RequestService", "SwarmAddrs", "MFOpenTempFile", "MFTemp2MacFile", "MFSetData",
    "MFGetData", "MMCreate", "MMOpen", "Hset", "Hget", "Zadd", "Zrangebyscore", "Zrange", "MFOpenMacFile","MFStat",
    "MFReaddir", "MFGetMimeType", "MFSetObject", "MFGetObject", "Zcount", "Zrevrange", "Hlen", "Hscan", "Hrevscan"
];

function getcurips() {
    let ips = "127.0.0.1:4800"
    // getParam is a Leither function
    if (window.getParam != null){
        let p=window.getParam()
        ips = p["ips"][p.CurNode]
        console.log("window.getParam", ips, p)
    } else if (window.location.host != ""){
        ips = window.location.host
        console.log("window.location", ips)
    }
    { //for test
        ips = "192.168.1.101:4800"
        ips = '[240e:390:e6f:4fb0:e4a7:c56d:a055:2]:4800'
        ips = "1.172.95.70:4800"
    }
    return ips
};
const ips = getcurips();

export const useLeither = defineStore({
    id: 'LeitherApiHandler', 
    state: ()=>({
        sid: "",
        returnUrl: ""
    }),
    getters: {
        // console.log(state.hostUrl)
        client: (state) => window.hprose.Client.create("ws://" + ips +"/ws/", ayApi),
        hostUrl: () => "ws://" + ips +"/ws/",
        baseUrl: () => "http://" + ips + "/"
    },
    actions: {
        getLocalApiHandler() {
            // // use local credential to access resources. Works only in local network.
            // let apiHandler: any = {};
            // //生成操作句柄
            // apiHandler.client = this.client;
        
            // //以上部分可以提取公用代码
            // return apiHandler.client.GetVarByContext("", "ppt")
            // .then((ppt:string)=>{
            //     console.log("ppt=", ppt)
            //     console.log("data=", JSON.parse(ppt).Data)
            //     return apiHandler.client.Login(ppt)
            //     })
            // .then((reply:any)=>{
            //     apiHandler.ips = ips
            //     apiHandler.isLogined = true
            //     apiHandler.baseUrl = baseurl
            //     apiHandler.sid = reply.sid
            //     apiHandler.leitherid = reply.uid
        
            //     console.log("sid=", reply.sid)
            //     console.log("uid=", reply.uid)
            //     console.log("apiHandler=", apiHandler)
            //     return apiHandler
            //     //查询应用            
            //     //showapps(sid)
            // }).catch((r:Error)=>{
            //     console.error(r)
            // })
            ;
        },
        async login(user="", pswd="") {
            return new Promise((resolve)=>{
                if (user=="") {
                    // guest user
                    console.log("user=",user, pswd)
                    resolve(true)
                    return
                }
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
        }
    }
})

export const useMimei = defineStore({
    // manager persistent state variables
    id: 'MMInfo',
    state: ()=>({
        _mid: "",
        _mmsid: "",
        _column: null as any,
        _fileName: "" as string | null,        // !!! global MM file name for this App
    }),
    getters: {
        mid: (state) => {
            if (!state._mid) {
                state._mid = JSON.parse(localStorage.getItem("mmInfo")!)._mid
            }
            return state._mid;
        },
        mmsid: (state) => {
            if (!state._mmsid) {
                state._mmsid = JSON.parse(localStorage.getItem("mmInfo")!)._mmsid
            }
            return state._mmsid;
        },
        column: (state) => {
            if (!state._column) {
                if (!localStorage.getItem("currentColumn"))
                    // default column item
                    state._column = {title: "News", titleZh:"最新文档", orderBy:0}
                else
                    state._column = JSON.parse(localStorage.getItem("currentColumn")!)
            }
            return state._column;
        },
        fileName: (state) => {
            if (state._fileName==="") {
                if (!localStorage.getItem("mmFileName")) {
                    state._fileName = "file_list"
                    localStorage.setItem("mmFileName", state._fileName)
                }
                else
                    state._fileName = localStorage.getItem("mmFileName")
            }
            return state._fileName;
        }
    },
    actions: {
        setMMInfo(mid: string, mmsid: string) {
            this.$state._mid = mid
            this.$state._mmsid = mmsid
            localStorage.setItem("mmInfo", JSON.stringify({_mid:mid, _mmsid:mmsid}))
        },
        setColumn(c: ContentColumn) {
            this.$state._column = c
            localStorage.setItem("currentColumn", JSON.stringify(c))
        },
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


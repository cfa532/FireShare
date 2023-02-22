import { defineStore } from 'pinia';
// import { useRouter} from 'vue-router';
import { router } from '../router'
// const router = useRouter();
// Hprose API
const ayApi = ["GetVarByContext", "Act", "Login", "Getvar", "Getnodeip", "SwarmLocal", "DhtGetAllKeys","MFOpenByPath",
    "DhtGet", "DhtGets", "SignPPT", "RequestService", "SwarmAddrs", "MFOpenTempFile", "MFTemp2MacFile", "MFSetData",
    "MFGetData", "MMCreate", "MMOpen", "Hset", "Hget", "Hmset", "Hmget", "Zadd", "Zrangebyscore", "Zrange", "MFOpenMacFile",
    "MFReaddir", "MFGetMimeType", "MFSetObject", "MFGetObject", "Zcount", "Zrevrange", "Hlen", "Hscan", "Hrevscan",
    "MMRelease", "MMBackup", "MFStat", "Zrem", "Zremrangebyscore", "MiMeiPublish", "PullMsg", "MFTemp2Ipfs", "MFSetCid",
    "MMSum", "MiMeiSync", "IpfsAdd"
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
        // ips = "192.168.1.3:4800"
        ips = "192.168.1.4:8000"
        // ips = '[240e:390:e6f:4fb0:e4a7:c56d:a055:2]:4800'
        // ips = "125.121.63.198:8000"
    }
    return ips
};
const ips = getcurips();

export const useSpinner = defineStore({
    id: "loadSpinner",
    state: ()=>({
        loading: true
    }),
    actions: {
        setLoadingState(s: boolean) {
            this.loading = s;
        }
    }
});

export const useLeither = defineStore({
    id: 'LeitherApiHandler', 
    state: ()=>({
        _sid: "",
        returnUrl: "",
        hostUrl: "ws://" + ips +"/ws/",
        baseUrl: "http://" + ips + "/",
    }),
    getters: {
        // console.log(state.hostUrl)
        client: (state) => window.hprose.Client.create(state.hostUrl, ayApi),
        sid: (state) => {
            if (sessionStorage.getItem("sid")) {
                state._sid = sessionStorage.getItem("sid")!
            }
            return state._sid;
        }
    },
    actions: {
        login(user="", pswd="") {
            return new Promise<string>((resolve, reject)=>{
                // if (user=="") {
                //     // guest user
                //     console.log("user=",user, "psd=", pswd)
                //     resolve(true)
                //     return
                // }
                this.client.Login(user, pswd, "byname").then(
                    // this.client.Login("lsb", "123456", "byname").then(
                    (result:any)=>{ 
                        this._sid = result.sid
                        sessionStorage.setItem("sid", result.sid)
                        this.client.SignPPT(this._sid, {
                            CertFor: "Self",
                            Userid: result.uid,
                            RequestService: "mimei"
                        }, 1).then(
                            (ppt:any)=>{
                            console.log("ppt=", JSON.parse(ppt))
                            this.client.RequestService(ppt).then(
                                (map:any)=>{
                                    console.log("Request service, ", map)
                                    console.log("return url", this.returnUrl)
                                    resolve(this.returnUrl.slice(2))         // remove the leading #/
                                    // router.push(this.returnUrl.slice(2))   
                                }, (err:Error)=>{
                                    console.error("Request service error=", err)
                                    reject("Request service error")
                                })
                        }, (err:Error)=>{
                            console.error("Sign PPT error=", err)
                            reject("Sign PPT error")
                        })
                    }, (e:Error) => {
                        console.error("Login error=", e)
                        reject("Login error")
                    }
                )
            })
        },
        logout() {
            sessionStorage.setItem("sid", "");
            this._sid = "";
            router.push({name: "main"});
        }
    }
})

export const useMimei = defineStore({
    // manager persistent state variables
    id: 'MMInfo',
    state: ()=>({
        api: {} as any,      // leither api handler
        // appid: "54EWqhacwGq8G800gMsQfcTC_Mz", "BM5UwSlQKiYbySrC5VLBYwFHY3s",
        // webdav: "tFy6mNifSXwt9nlyj4PYw_pJ9tM",   // 1.4
        // webdav: tA_66BjRts-xDEwlEb5STOZs4I5,     // 1.3
        midNaviBar: "ZXYnjn7xo_oHPpzLfopKIkRuxkc",      // navigation bar' mid
        mid: "CNyB67yd4h9Gt-wJRep2aRgZyAD",             // fireshare_ipfs
        // mid: "ilc_mDQ-vS9jRIRw2w70pyf8ASN",             // for testing
        _mmsid: "",
        _naviColumnTree: [] as ContentColumn[],            // current Column object. Set when title is checked.
    }),
    getters: {
        naviColumnTree: function(state) {
            return new Promise<ContentColumn[]>((resolve, reject)=>{
                // state._naviColumnTree = [
                //     {"title":"News", "titleZh":"最新文档"}, 
                //     {"title":"Pictures", "titleZh":"图片专区", "subColumn": [
                //         {"title":"Western", "titleZh":"洋画"},
                //         {"title":"Japan", "titleZh":"邦画"},
                //         {"title":"Test", "titleZh":"TCL"}
                //     ]},
                //     {"title":"Webdav", "titleZh":"本地文档"}
                // ];
                // resolve(state._naviColumnTree);
                if (state._naviColumnTree.length>0) resolve(state._naviColumnTree);
                else {
                    // if (localStorage.getItem("navibarcolumns")) {
                    //     state._naviColumnTree = JSON.parse(localStorage.getItem("navibarcolumns")!)
                    //     resolve(state._naviColumnTree)
                    //     return
                    // }
                    this.api.client.MMOpen(this.api.sid, this.midNaviBar, "last", (mmsid: string)=>{
                        console.log("MMOPen mmsid="+mmsid, "sid="+this.api.sid)
                        this.api.client.MFGetObject(mmsid, (o:any)=>{
                            state._naviColumnTree = o
                            resolve(o)
                        }, (err:Error)=>{
                            reject("useMimei MFGetObject err="+err)
                        })
                    }, (err:Error)=>{
                        reject("useMimei MMOpen err="+err)
                    })
                }
            })
        },    
        mmsid: function(state) {
            return new Promise<string>((resolve, reject)=>{
                if (state._mmsid) resolve(state._mmsid);
                else {
                    this.api.client.MMOpen(this.api.sid, this.mid, "last", (mmsid: string)=>{
                        state._mmsid = mmsid;
                        resolve(mmsid);
                    }, (err:Error)=>{
                        reject("useMimei MMOpen mmsid err="+err)
                    })
                }
            })
        },
        mmsidCur: function(state) {
            return new Promise<string>((resolve, reject)=>{
                this.api.client.MMOpen(this.api.sid, this.mid, "cur", (mmsid: string)=>{
                    resolve(mmsid);
                }, (err:Error)=>{
                    reject("useMimei MMOpen mmsid err="+err)
                })
            })
        },
    },
    actions: {
        async init(api: any) {        // leither api object
            this.$state.api = api;
            return Promise.all([this.mmsid, this.naviColumnTree]).then((res)=>{
                localStorage.setItem("navibarcolumns", JSON.stringify(res[1]))        // do it once during initiation  
                window.mmInfo = this.$state;
                return this;
            })
        },
        async backup() {
            try {
                let newVer = await this.api.client.MMBackup(this.api.sid, this.mid, '')
                this.$state._mmsid = await this.api.client.MMOpen(this.api.sid, this.mid, "last");
                // now publish a new version of database Mimei
                let ret:DhtReply = this.api.client.MiMeiPublish(this.api.sid, "", this.mid)
                console.log("Mimei publish []DhtReply=", ret, this._mmsid, "newVer="+newVer)
            } catch(err:any) {
                throw new Error("Backup error", err)
            }
        },
        async getColumn(title: string) {
            // given title, return Column obj, and set Column at the same time
            return findColumn(await this.naviColumnTree, title);
        },
        async renewMMSid() {
            this._mmsid = await this.api.client.MMOPen(this.api.sid, this.mid, "last");
            return this._mmsid;
        },
        downLoadByFileData(content:Uint8Array, fileName:string, mimeType:string) {
            var a = document.createElement("a");
            a.href = window.URL.createObjectURL(new Blob([content], {type: mimeType}));
            a.download = fileName.substring(fileName.lastIndexOf('/')+1);   // get the file name to be downloaded
            a.type =  mimeType;
            a.click();
            window.URL.revokeObjectURL(a.href);
        }
    }
});

function findColumn(cols:ContentColumn[], title:string) :ContentColumn|undefined  {
    let col = cols.find((c) => c.title===title);
    if (!col) {
        for(var c of cols) {
            if (c.subColumn) {
                var c1 = findColumn(c.subColumn, title);
                if (c1) return c1;
            }
        }
    }
    return col
}


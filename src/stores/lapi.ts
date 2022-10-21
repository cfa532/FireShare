import { defineStore } from 'pinia'
// Hprose API
const ayApi = ["GetVarByContext", "Act", "Login", "Getvar", "Getnodeip", "SwarmLocal", "DhtGetAllKeys","MFOpenByPath",
    "DhtGet", "DhtGets", "SignPPT", "RequestService", "SwarmAddrs", "MFOpenTempFile", "MFTemp2MacFile", "MFSetData",
    "MFGetData", "MMCreate", "MMOpen", "Hset", "Hget", "Hmget", "Zadd", "Zrangebyscore", "Zrange", "MFOpenMacFile","MFStat",
    "MFReaddir", "MFGetMimeType", "MFSetObject", "MFGetObject", "Zcount", "Zrevrange", "Hlen", "Hscan", "Hrevscan", "MMRelease",
    "MFBackup"
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
        // ips = '[240e:390:e6f:4fb0:e4a7:c56d:a055:2]:4800'
        // ips = "1.172.98.151:4800"
    }
    return ips
};
const ips = getcurips();

export const useLeither = defineStore({
    id: 'LeitherApiHandler', 
    state: ()=>({
        sid: "",
        returnUrl: "",
        hostUrl: "ws://" + ips +"/ws/",
        baseUrl: "http://" + ips + "/",
    }),
    getters: {
        // console.log(state.hostUrl)
        client: (state) => window.hprose.Client.create(state.hostUrl, ayApi),
    },
    actions: {
        async login(user="", pswd="") {
            return new Promise((resolve)=>{
                // if (user=="") {
                //     // guest user
                //     console.log("user=",user, "psd=", pswd)
                //     resolve(true)
                //     return
                // }
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
        api: {} as any,      // leither api handler
        midNaviBar: "RyaWr1HkShxQvonM9aVqAb7ShXf",      // navigation bar' mid
        mid: "q812I4M1SeEI8BuSJ1XK02sELgT",             // APP datbase mid
        _mmsid: "",
        _naviColumnTree: [] as ContentColumn[],            // current Column object. Set when title is checked.
        // naviColumnTree: [
        //     {title:"News", titleZh:"最新文档", orderBy:0}, 
        //     {title:"Pictures", titleZh:"图片专区", orderBy:1, subColumn: [
        //         {title:"Western", titleZh:"洋画", orderBy:0},
        //         {title:"Japan", titleZh:"邦画", orderBy:1},
        //         {title:"Test", titleZh:"TCL", orderBy:2},
        //     ]},
        //     {title:"Webdav", titleZh:"本地文档", orderBy:2}
        // ],
    }),
    getters: {
        naviColumnTree: function(state) {
            return new Promise<ContentColumn[]>((resolve, reject)=>{
                if (state._naviColumnTree.length>0) resolve(state._naviColumnTree);
                else {
                    // if (localStorage.getItem("navibarcolumns")) {
                    //     state._naviColumnTree = JSON.parse(localStorage.getItem("navibarcolumns")!)
                    //     resolve(state._naviColumnTree)
                    //     return
                    // }
                    this.api.client.MMOpen(this.api.sid, this.midNaviBar, "last", (mmsid: string)=>{
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
            return new Promise((resolve, reject)=>{
                if (state._mmsid) resolve(state._mmsid);
                else {
                    this.api.client.MMOpen(this.api.sid, this.mid, "cur", (mmsid: string)=>{
                        state._mmsid = mmsid;
                        resolve(mmsid);
                    }, (err:Error)=>{
                        reject("useMimei MMOpen mmsid err="+err)
                    })
                }
            })
        },
    },
    actions: {
        async init(api: any) {        // leither api object
            this.$state.api = api;
            return Promise.allSettled([this.mmsid, this.naviColumnTree]).then((res)=>{
                localStorage.setItem("navibarcolumns", JSON.stringify(res[1].value))        // do it once during initiation  
                window.mmInfo = this.$state;
                return this;
            })
        },
        async getColumn(title: string) {
            // given title, return Column obj, and set Column at the same time
            return findColumn(await this.naviColumnTree, title);
        },
        downLoadByFileData(content:Uint8Array, fileName:string, mimeType:string) {
            var a = document.createElement("a");
            a.href = window.URL.createObjectURL(new Blob([content], {type: mimeType}));
            a.download = fileName.substring(fileName.lastIndexOf('/')+1);
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


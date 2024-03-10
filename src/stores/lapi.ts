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
    "MMSum", "MiMeiSync", "IpfsAdd", "MMAddRef", "MMDelRef", "MMDelVers", "MMRelease", "MMGetRef", "MMGetRefs", "Hdel",
    "DhtFindPeer", "Logout"
];

function getCurNodeIP() {
    let ip = "127.0.0.1:4800"
    // getParam is a Leither function
    if (window.getParam != null){
        let p=window.getParam()
        ip = p["ips"][p.CurNode]
        console.warn("window.getParam", p["aid"], import.meta.env.VITE_MIMEI_DB)
    } else if (window.location.host != ""){
        ip = window.location.host
        console.log("window.location", ip)
    }
    // replace it with testing node if defined
    return import.meta.env.VITE_LEITHER_NODE ? import.meta.env.VITE_LEITHER_NODE : ip
};
const curIP = getCurNodeIP();

export const useLeither = defineStore({
    id: 'LeitherApiHandler', 
    state: ()=>({
        _sid: "",
        returnUrl: "",
        baseIP: curIP,
        hostIP: "",    // IP address of node to write
    }),
    getters: {
        client: (state) => window.hprose.Client.create("ws://" + state.baseIP +"/ws/", ayApi),
        baseUrl: (state) => window.location.protocol+'//'+state.baseIP+'/' ,
        sid: (state) => {
            if (sessionStorage.getItem("sid") && !state._sid) {
                state._sid = sessionStorage.getItem("sid")!
            }
            return state._sid;
        }
    },
    actions: {
        login(user: string, pswd: string) {
            let nodes = (import.meta.env.VITE_NODE_LIST as string).split(/\s*,\s*/)
            this.hostIP = ""
            nodes.forEach(async nid => {
                var n: AddrInfo = await this.client.DhtFindPeer(this.sid, nid)
                n.addrs.forEach(l => {
                    var addr = l.split('/')
                    var ip = addr[2]
                    var port = addr[4]
                    if (!ip.startsWith('192.168')) {
                        console.log(ip + ":" + port, nid)
                        sendRequest(ip + ":" + port)
                    }
                })
            })

            // test availability of the ip
            const sendRequest = (ip: string) => {
                let xhr = new XMLHttpRequest();
                xhr.open('GET', ip, true);
                xhr.timeout = 5000; // 5 seconds timeout
                xhr.ontimeout = () => console.warn(`Timeout for ${ip}`);
                xhr.onload = () => {
                    if (xhr.status === 200 && !this.hostIP) {
                        this.hostIP = ip;
                        // this.hostUrl = window.location.protocol + ip;
                        this.baseIP = this.hostIP      // switch to node that can write to MM aftre login
                        console.log(`First responded host ${this.baseUrl}`)
                        nLogin(this)
                    }
                };
                xhr.send(null);
            };

            // return new Promise<string>((resolve, reject)=>{
            // })
            function nLogin(that: any) {
                that.client.Login(user, pswd, "byname").then(
                    (result: any) => {
                        that._sid = result.sid
                        sessionStorage.setItem("sid", result.sid)
                        that.client.SignPPT(result.sid, {
                            CertFor: "Self",
                            Userid: result.uid,
                            RequestService: "mimei"
                        }, 1).then(
                            (ppt: any) => {
                                that.client.RequestService(ppt).then(
                                    (map: any) => {
                                        // get IP of a node the user can write to and switch to it.
                                        console.log(`Request service:`, result, that.$state, that.returnUrl)
                                        that.returnUrl = that.returnUrl.slice(2)         // remove the leading #/
                                        useMimei().$reset()
                                        router.push(that.returnUrl)
                                    }, (err: Error) => {
                                        console.error(`Request service error ${err}`)
                                    })
                            }, (err: Error) => {
                                console.error("Sign PPT error=", err)
                            })
                    }, (e: Error) => {
                        console.error("Login error=", e)
                    }
                )
            }
        }, 
        logout(path:any=null) {
            // this.client.Logout(this.sid, "Logout Leither")
            sessionStorage.removeItem("sid")
            this._sid = "";
            // this.baseUrl = "http://" + this.baseIP + "/"        // switch back to the fastest IP
            this.baseIP = curIP
            this.hostIP = ""
            useMimei().$reset()
            if (path) router.push(path);
        },
    }
})

export const useMimei = defineStore({
    // manager persistent state variables
    id: 'MMInfo',
    state: ()=>({
        api: useLeither(),      // leither api handler
        mid: import.meta.env.VITE_MIMEI_DB,  // database Mimei for this App
        _mmsid: "",
    }),
    getters: {
        naviColumnTree: function(state) {
            return [
                {"title":"News", "titleZh":"News"}, 
                {"title":"World", "titleZh":"World"}, 
                {"title":"Videos", "titleZh":"小视频"}, 
                {"title":"Pictures", "titleZh":"图文"}, 
                {"title":"Twitter", "titleZh":"X", "subColumn": [
                    {"title":"Contrarian", "titleZh":"Noop"},
                    {"title":"Funny", "titleZh":"搞笑"},
                    {"title":"Cutie", "titleZh":"文革"},
                    {"title":"History", "titleZh":"老故事"},
                ]},
                {"title":"Exercise", "titleZh":"运动"},
                {"title":"Test", "titleZh":"TCL"},
                {"title":"Webdav", "titleZh":"本地文档"}
            ];
        },    
        mmsid: async function(state) :Promise<string> {
            state._mmsid = state._mmsid? state._mmsid : await this.api.client.MMOpen(this.api.sid, this.mid, "last");
            return state._mmsid;
        },
        mmsidCur: async function(state) :Promise<string> {
            return await this.api.client.MMOpen(this.api.sid, this.mid, "cur");
        },
    },
    actions: {
        // init(api: any) {        // leither api object
        //     this.$state.api = api;
        //     window.mmInfo = this.$state;    // for easy testing
        //     return this;
        // },
        async backup() {
            try {
                let newVer = await this.api.client.MMBackup(this.api.sid, this.mid,"",'delref=true')
                // now publish a new version of database Mimei
                let ret:DhtReply = await this.api.client.MiMeiPublish(this.api.sid, "", this.mid)
                this.$state._mmsid = await this.api.client.MMOpen(this.api.sid, this.mid, "last");
                console.log("Mimei publish []DhtReply=", ret, this._mmsid, "newVer="+newVer)
            } catch(err) {
                console.error("Backup or Publish error,", err)
                throw new Error(err as string)
            }
        },
        async getColumn(title: string) {
            // given title, return Column obj, and set Column at the same time
            return findColumn(this.naviColumnTree, title);

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


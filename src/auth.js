export { getLocalApiHandler, getLApi}

const ayApi = ["GetVarByContext", "Act", "Login", "Getvar", "Getnodeip", "SwarmLocal", "DhtGetAllKeys",
    "DhtGet", "DhtGets", "SignPPT", "RequestService", "SwarmAddrs", "MFOpenTempFile", "MFTemp2MacFile", "MFSetData",
    "MFGetData", "MMCreate", "MMOpen", "Hset", "Hget", "Zadd", "Zrangebyscore", "Zrange", "MFOpenMacFile"];
function getcurips() {
    //缺省的地址，用于本地调试程序
    let ips = "127.0.0.1:4800";
    //获取节点链接
    if (window.getParam != null) {
        let p = window.getParam();
        console.log("p=", p);
        ips = p["ips"][p.CurNode];
        // hosturl = "ws://" + p["ips"][p.CurNode] + "/ws/"
        // baseurl = "http://" + p["ips"][p.CurNode] + "/"
    }
    else if (window.location.host != "") {
        ips = window.location.host;
        // hosturl = "ws://" + window.location.host + "/ws/"
        // baseurl = "http://" +  window.location.host + "/"
    }
    { //for test
        ips = "192.168.1.102:4800";
    }
    // window.lapi.ips = ips
    return ips;
}
function getLocalApiHandler() {
    let apiHandler = {};
    let ips = getcurips();
    let hosturl = "ws://" + ips + "/ws/";
    let baseurl = "http://" + ips + "/";
    //生成操作句柄
    apiHandler.client = window.hprose.Client.create(hosturl, ayApi);
    //以上部分可以提取公用代码
    return apiHandler.client.GetVarByContext("", "ppt")
        .then((ppt) => {
        console.log("ppt=", ppt);
        console.log("data=", JSON.parse(ppt).Data);
        return apiHandler.client.Login(ppt);
    })
        .then((reply) => {
        apiHandler.ips = ips;
        apiHandler.isLogined = true;
        apiHandler.baseUrl = baseurl;
        apiHandler.sid = reply.sid;
        apiHandler.leitherid = reply.uid;
        console.log("sid=", reply.sid);
        console.log("uid=", reply.uid);
        console.log("apiHandler=", apiHandler);
        return apiHandler;
        //查询应用            
        //showapps(sid)
    });
}

const api = {};
api.sid = ""
api.ips = getcurips();
api.baseUrl = "http://" + api.ips + "/";
api.hosturl = "ws://" + api.ips + "/ws/";
//生成操作句柄
api.client = window.hprose.Client.create(api.hosturl, ayApi);
//以上部分可以提取公用代码
console.log("api=", api)

//异常处理函数
var Catch = function(e) {
    console.error(e);
    alert(e)
    api.sid = ""
};

function getLApi() {
    var Promise = window.Promise;
    return new Promise(function(resolve, reject) {
        if (api.sid != ""){
            console.log("getSid resolve sid", api.sid)
            resolve(api)
        } else {
            //这是提前设置好的用户名密码，资源授权的情况下，可以使用guest帐号
            api.client.Login("lsb", "123456", "byname").then(result=>{ 
                api.sid = result.sid
                api.Userid = result.uid
                console.log("getSid", result)
                api.client.SignPPT(api.sid, {
                    CertFor: "Self",
                    Userid: api.Userid,
                    RequestService: "mimei"
                }, 1).then(ppt=>{
                    console.log("ppt=", JSON.parse(ppt))
                    api.ppt = ppt
                    api.client.RequestService(ppt).then(map=>{
                        console.log("Request service, ", map, api)
                        resolve(api)
                    }, err=>{
                        console.error("Request service error=", err)
                    })
                }, err=>{
                    console.error("Sign PPT error=", err)
                })
            }, function(e) {
                console.error("Login error=", e)
                api.sid = ""
                reject(e)
            })
        }
    })
}

function loginPeer(piurl){
    apiHandler.then((api)=>{
        console.log("api.Client.SignPPT")
        //生成ppt
        return api.client.SignPPT(api.sid, {
            CertFor:"Self",
            Userid:api.Userid,
            RequestService: "mimei"
        }, 1)
    }).then(ppt=>{
        console.log("ppt=", ppt)
        //知道对方的url
        return getApiHandler(piurl, ppt)
    }).then(doAll, e=>{
        console.log("e=", e)
    })
}

//读出通行证中的userid
function showPPT(strppt){
    console.log("ppt=", strppt)
    var ppt = JSON.parse(strppt)
    // for (k in ppt){
    //     console.log("k=", k)        
    // }
    console.log("data=", ppt.Data)

}

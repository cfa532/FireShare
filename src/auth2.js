export { getLocalApiHandler, getLApi}

const ayApi = ["GetVarByContext", "Act", "Login", "Getvar", "Getnodeip", "SwarmLocal", "DhtGetAllKeys",
    "DhtGet", "DhtGets", "SignPPT", "SwarmAddrs", "MFOpenTempFile", "MFTemp2MacFile", "MFSetData",
    "MFGetData", "MMCreate", "MMOpen", "Hset", "Hget", "Zadd", "Zrangebyscore", "Zrange", "MFOpenMacFile"];
var api = {};
api.sid = ""
api.ips = getcurips();
api.baseUrl = "http://" + api.ips + "/";
api.hosturl = "ws://" + api.ips + "/ws/";
//生成操作句柄
api.client = window.hprose.Client.create(api.hosturl, ayApi);
//以上部分可以提取公用代码
console.log("api=", api)

function getcurips() {
    //缺省的地址，用于本地调试程序
    var ips = "127.0.0.1:4800";
    //获取节点链接
    if (window.getParam != null) {
        var p = window.getParam();
        console.log("p=", p);
        ips = p["ips"][p.CurNode];
    }
    else if (window.location.host != "") {
        ips = window.location.host;
        console.log("location=", ips)
    }
    { //for test
        ips = "192.168.1.104:4800";
    }
    return ips;
}

// PPT login
function getLocalApiHandler() {
    return api.client.GetVarByContext("", "ppt")
        .then(function (ppt) {
        console.log("ppt=", ppt);
        console.log("data=", JSON.parse(ppt).Data);
        return api.client.Login(ppt);
    })
        .then(function (reply) {
        api.isLogined = true;
        api.baseUrl = baseurl;
        api.sid = reply.sid;
        api.leitherid = reply.uid;
        console.log("lapi=", api);
        return api;
        //查询应用            
        //showapps(sid)
    })
};

//异常处理函数
var Catch = function(e) {
    console.error(e);
    alert(e)
    api.sid = ""
};

function getSid() {
    // var Promise = api.Promise;
    return new Promise(function(resolve, reject) {
        if (api.sid!=""){
            console.log("getSid resolve sid", api.sid)
            resolve(api.sid)
            return
        }
        api.client.ready(function(stub) {
            console.log("getSid login")
            //这是提前设置好的用户名密码，资源授权的情况下，可以使用guest帐号
            stub.Login("lsb", "123456", "byname").then(function(result) { 
                api.sid = result.sid
            resolve(api.sid)
         }, reject) //login.then end
     }, reject); //client.ready end         
    });//new Promise end
}

function getLApi() {
    api.client.ready(function(stub) {
        getSid().then(function(sid) {    
            console.log("Login ok sid=", sid, stub)
            return api;
        }, Catch)
    }, Catch);
}

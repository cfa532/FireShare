console.log("request=", request)


let sid = request["sid"]
console.log("sid=", sid)

let aid = request["aid"]
console.log("aid=", aid)

let ver = request["ver"]
console.log("ver=", ver)

try {
    var appsid = lapi.OpenAppDataNode("cur")
    console.log("appsid=", appsid)

    lapi.Set(appsid, "apkey", "apvalue");
    let value = lapi.Get(appsid, "apkey");
    console.log("lapi.Get apkey value=", value)
} catch (e) {
    console.log("OpenAppDataNode err=", e)
}

let gsid = lapi.CreateSession()
console.log("gsid", gsid)
lapi.SessionSet(gsid, "appsid", appsid)
let value = lapi.SessionGet(gsid, "appsid")
console.log("appsid", value)
value
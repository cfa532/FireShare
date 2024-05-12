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

    let temp  = lapi.Get(appsid, "admin")
    if (!temp) {
        lapi.Set(appsid, "admin", "123456")
    }
} catch (e) {
    console.error("OpenAppDataNode err=", e)
}

let gsid = lapi.CreateSession()
console.log("gsid", gsid)
lapi.SessionSet(gsid, "appsid", appsid)
let value = lapi.SessionGet(gsid, "appsid")
console.log("appsid", value)

let mid = lapi.MMOpenGetAppData(sid, aid, "user", "5lrADJpzRpYZ82-6jkewoa1w3jB")

{sid: gsid; mid: mid}

function resetPassword(appsid, passwd="123456") {
    lapi.Set(appsid, "admin", passwd)
}

function resetRoot() {
    lapi.Set(appsid, "admin", "123456")
}
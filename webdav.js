(function(global) {
    //缺省的地址，用于本地调试程序
    //var hosturl = "ws://127.0.0.1:4800/ws/"
    //var baseurl = "http://127.0.0.1:4800/"
    var nodeUrl = "127.0.0.1:4800"
    var mid ="" //= "dN9VenPNBMiNYnu-tOyOZ8xBYf1"
    var ver = "last"
    
    //获取节点链接
    if (window.getParam != null){
        p=window.getParam()
        console.log("p=", p)
        nodeUrl = p["ips"][p.CurNode]
        //hosturl = "ws://" + p["ips"][p.CurNode] + "/ws/"
        //baseurl = "http://" + p["ips"][p.CurNode] + "/"
        mid = p.mid
        ver = p.ver
    } else if (window.location.host != ""){
        //hosturl = "ws://" + window.location.host + "/ws/"
        //baseurl = "http://" +  window.location.host + "/"
        nodeUrl = window.location.host
    }
    
    var hosturl = "ws://" +  nodeUrl + "/ws/"
    var baseurl = "http://" +  nodeUrl + "/"
    
    // function GetStub(hosturl){
    //     var client = hprose.Client.create(hosturl)
    //     var Promise = global.Promise;
    //     return new Promise((resolve, reject) =>{
    //         client.ready((stub) =>{
    //             resolve(stub)
    //         }, Catch);
    //     });//new Promise end
    // }
    
    //生成操作句柄
    var client = hprose.Client.create(hosturl/*, 
        ["Login","MMOpen", "MFOpenByPath", "MFStat","MFReaddir", "MFGetData", "MFGetMimeType"]*/);
    
    console.log("baseurl=", baseurl);
    var sid = "";
    //var mmfssid = "";
    
    //异常处理函数
    var Catch = function(e) {
        console.error(e);
        alert(e)
        sid = ""
    };
    
    var objUrl = ""
    var strinfo = '<a>除域名解析外，应用和流量均来自家用节点和网络</a>'
    //var strinfo = '<a></a>'
    
    //获取登录sid
    async function getSid(){
        console.log("getSid begin global=", global);
       // console.log(global.Promise)
        var Promise = global.Promise;
        return new Promise(function(resolve, reject) {
            console.log("getSid")
            if (sid!=""){
                console.log("getSid resolve sid")
                resolve(sid)
                return
            } 
            resolve(sid)    //全部使用guest用户
     
        //     client.ready(function(stub) {
        //         if (mid!=""){
        //             //这里使用guest用户，也就是sid为空
        //             resolve(sid)    
        //         }
        //         resolve(sid)    //全部使用guest用户
        //         // console.log("getSid login")
        //         // //这是提前设置好的用户名密码，资源授权的情况下，可以使用guest帐号
        //         // stub.Login("lsb", "123456", "byname").then(function(result) { 
        //         // sid = result.sid
        //         // resolve(sid)
        //      }, reject) //login.then end
        //  }, reject); //client.ready end         
        });//new Promise end
    }
    
    function runApi(f){
        client.ready((stub) =>{
            console.log("runApi getSid");
            getSid().then(function(sid) {    
                console.log("Login ok sid=", sid)
                f(stub, sid)
            }, function(e){
                console.log("runApi getSid fail");
                sid = ""
                Catch(e)
            })
        }, Catch);
    }
    
    function fullShow(){ 
        console.log("fullShow", baseurl);
        runApi(show)
    };
    
    fullShow();
    
    //获取#之后的文件路径
    function getFilePathFromHash(){
        var hash = window.location.hash    
        if (hash.indexOf('#/') ==0){
            hash = hash.slice(1)        
            return hash
        }
    
        if (hash.indexOf('/') !=0){
            return '/' + hash        
        }    
        return hash
    }
    
    //获取文件路径
    function getFilePath(fileName){
        var basePath = getFilePathFromHash()
        //console.log("getFilePathFromHash ok", basePath);  
        if (basePath.length == 0){
            return '/' + fileName 
        }
        //console.log("getFilePath 1", basePath);  
        if (basePath.charAt(basePath.length-1) == "/"){
            //console.log(basePath +  fileName);  
            return basePath +  fileName
        }    
        return basePath + "/" + fileName
    }
    
    function show(stub, sid){
        var filePath = getFilePathFromHash()
        filePath = decodeURI(filePath)
    
        //console.log("filePath=", filePath);  
    
        console.log("show MFOpenByPath sid:", sid, " filePath=", filePath); 
       // func (wa *WebApi) MMOpen(sid, mid, ver string) (string, error) 
        showobj = (mmfsid) =>{
            console.log("MFOpenByPath ok mmfssid=", mmfsid)
            stub.MFStat(mmfsid).then(function(fi) {
                console.log("MFStat ok fi=", fi)
             //console.log("MFStat ok fi.isdir=", fi.fIsDir)
                if (fi.fIsDir){
                    console.log("fi.fIsDir true")
                    showDir(stub, mmfsid)
                } else{
                    console.log("fi.fIsDir false")
                    showFile(stub, mmfsid, filePath)
                }
            }, Catch)
        }
    
        if (mid ==""){
            stub.MFOpenByPath(sid, "mmroot", filePath, 0).then(showobj, Catch)
        } else {
            console.log("MMOpen mid=", mid, "filePath=", filePath)
            stub.MMOpen(sid, mid, ver, filePath).then(showobj, Catch)
        }
    }
     
    
    // function downLoadByFileData(content, fileName, mimeType) {    
    //     var blob = new Blob([content], {type: mimeType});    
    //     //console.log("blob.type", blob.type);
    //     var a = document.createElement("a");
    //     var url = window.URL.createObjectURL(blob);    
    //     a.href = url;
    //     a.download = fileName;
    //     a.type =  mimeType;
    //     //console.log("downLoadByFileData ", fileName, "tpye=", a.type);
    //     a.click();
    //     window.URL.revokeObjectURL(url);
    // }
    
    // window.download =  function(filename){
    //         var filepath = getFilePath(filename)
    //         console.log("download", filepath);
    //         runApi(function(stub, sid) {
    //             console.log("download MFOpenByPath sid:", sid, " filePath=", filepath); 
    //             stub.MFOpenByPath(sid, "mmroot", filepath, 0).then(function(mmfsid) {
    //             //console.log("MFOpenByPath ok mmfssid=", mmfsid)
    //             //读出文件类型，暂时串行执行
    //             stub.MFGetMimeType(mmfsid).then(function(mimeType){       
    //             //读出文件内容
    //             stub.MFGetData(mmfsid, 0, -1).then(function(fileData) {    
    //             //console.log("MFGetData ok");  
    //             downLoadByFileData(fileData, filename, mimeType)
    //             }, Catch)}, Catch)}, Catch)}
    //         );
    //     };
    
    
    /*    
    function showFileByFileData(content, mimeType) {
        if (objUrl != ""){
            //alert("revokeObjectURL "+ objUrl);
            console.log("revokeObjectURL ", objUrl);
            window.URL.revokeObjectURL(objUrl);
        }
    
        var blob = new Blob([content], {type: mimeType});         
        //添加一个框架，用于显示和下载（微信不支持新窗口下载和显示）
        // {
        //     //canas方式
        //     strBody = '<canvas id="canvas"></canvas>'
        //     document.getElementById('LeitherBody').innerHTML = strBody
        //     var canvas = document.getElementById("canvas");
        //     console.log("canvas=", canvas);
        //     canvas.toBlob(function(blob){
        //         console.log(blob);
        //     });
        //     return
        // }
        //console.log("mimeType=", mimeType);  
        objUrl = window.URL.createObjectURL(blob);    
        {
            //定制方式
            if (mimeType == "image/jpeg"){
                //console.log("mimeType is pic");  
                strImage = '<img style="width:100%" src="' + objUrl+ '">'
                document.getElementById('LeitherBody').innerHTML = strImage    
                return
            }
            if (mimeType == "video/mp4"){
                //console.log("mimeType is video");  
                strVideo = '<video controls autoplay style="width:100%" id= "media" name="media"><source src="' + objUrl+ '" type="video/mp4"> </video>'
                document.getElementById('LeitherBody').innerHTML = strVideo    
                //console.log("video ok html=", strVideo);  
                return
            }        
        }
        {       
            //iframe方式        
            var strBody = '<iframe src='+ objUrl + 
            ' id="myiframe" scrolling="no" frameborder="0"  height="800" width="100%"></iframe>'
    
            //console.log("showFileByFileData strBody=", strBody);
            document.getElementById('LeitherBody').innerHTML = strBody
            return
        }
        
        //下面是旧的实现方法，弹出一个窗口，在微信中显示不正常
        // const a = document.createElement("a");
        // a.href = objUrl;    
        // a.type =  mimeType;
        // a.target = "_top"
        // console.log("showFileByFileData tpye=", a.type);
        // a.click();
        // window.URL.revokeObjectURL(objUrl);
    }
    */
    
    function showFile(stub, mmfsid, filePath){
    //    console.log("showFile")
        //读出文件类型，暂时串行执行
        stub.MFGetMimeType(mmfsid).then(function(mimeType){   
            //这里加入文件方式
            console.log("mimeType=  ", mimeType)
            objUrl = baseurl + "mf" + encodeURI(filePath) + "?mmsid="+ mmfsid
    
            if (mimeType == "video/mp4"){
                console.log("mimeType=", mimeType)
                console.log("mimeType is video", objUrl);  
                strVideo = '<video controls autoplay style="width:100%" id= "media" name="media"><source src="' + objUrl+ '" type="video/mp4"> </video>'
                strVideo = strVideo + strinfo
                document.getElementById('LeitherBody').innerHTML = strVideo    
                //console.log("video ok html=", strVideo);  
                return
            }   
            if (mimeType == "image/jpeg"){
                //objUrl = baseurl + "mf" + filePath + "?mmsid="+ mmfsid
                strImage = '<img style="width:100%" src="' + objUrl+ '">'
                strImage = strImage + strinfo
                document.getElementById('LeitherBody').innerHTML = strImage    
                return
            }
            
            if (mimeType == "application/pdf"){
                var strBody = '<iframe src='+ objUrl + 
                ' id="myiframe" scrolling="no" frameborder="0"  height="800" width="100%"></iframe>'
        
                console.log("showFileByFileData  pdf strBody=", strBody);
                document.getElementById('LeitherBody').innerHTML = strBody
                return
                //return
            }
    
            //读出文件内容
            // stub.MFGetData(mmfsid, 0, -1).then(function(fileData) {
            //     showFileByFileData(fileData, mimeType)
            // }, Catch)
            var strBody = '<iframe src='+ objUrl + 
            ' id="myiframe" scrolling="no" frameborder="0"  height="800" width="100%"></iframe>'
    
            console.log("showFileByFileData  pdf strBody=", strBody);
            document.getElementById('LeitherBody').innerHTML = strBody
        },Catch);
    }
    
    function showDir(stub, mmfsid){
        console.log("showDir ", mmfsid);  
        //读取目录内容
        stub.MFReaddir(mmfsid, -1).then(function(files) {
        console.log("MFReaddir ok files=", files)
        var strFileList = "<pre>"
        files.forEach(function(file){                          
            //console.log("filename=",file.fName);  
            //console.log("file.isdir=", file.fIsDir)
            var href = "#" + getFilePath(file.fName)
            //console.log("href=", href);  
            if (file.fIsDir){
                strFileList = strFileList.concat('<a href="', href, '">'+ file.fName + '</a>\n')
            } else {            
                strDownload = ""
                //strDownload = '          <button onclick="window.download('+"'"+ file.fName+"'" +')">download</button>'
                // strFileList = strFileList.concat('<a href="', href, '" target="_blank">',  file.fName, '</a>', strDownload, '\n')
                strFileList = strFileList.concat('<a href="', href, '">',  file.fName, '</a>', strDownload, '\n')
            }
        });        
        strFileList = strFileList + '</pre>' + strinfo
        //console.log(strFileList) 
        document.getElementById('LeitherBody').innerHTML = strFileList
        }, Catch)                
    }
    
    window.onhashchange = function(hash){
        console.log("onhashchange", hash)
        runApi(show)
    };
    
    // function encodeHtml(str){
    //     str = str.replace(/\r\n/g, "<br>")
    //     str = str.replace(/\n/g, "<br>")
    //     //console.log("encodeHtml str=", str)
    //     return str    
    // };
    
    })([eval][0]('this'));
    
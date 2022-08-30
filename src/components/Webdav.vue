<script setup lang="ts">
import { inject } from 'vue';
const api: any = inject("lapi");    // Leither api handler

var strinfo = '<a></a>'

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
    var filePath = window.decodeURIComponent(getFilePathFromHash())
    console.log("show MFOpenByPath sid:", sid, " filePath=", filePath); 
    stub.MFOpenByPath(sid, "mmroot", filePath, 0).then(function(mmfsid) {
    console.log("MFOpenByPath ok mmfssid=", mmfsid)
    stub.MFStat(mmfsid).then(function(fi) {
    console.log("MFStat ok fi=", fi)
    //console.log("MFStat ok fi.isdir=", fi.fIsDir)
    if (fi.fIsDir){
        showDir(stub, mmfsid)
    } else{
        showFile(stub, mmfsid, filePath)
    }
    }, Catch)}, Catch)
}

function downLoadByFileData(content, fileName, mimeType) {    
    var blob = new Blob([content], {type: mimeType});    
    //console.log("blob.type", blob.type);
    var a = document.createElement("a");
    var url = window.URL.createObjectURL(blob);    
    a.href = url;
    a.download = fileName;
    a.type =  mimeType;
    //console.log("downLoadByFileData ", fileName, "tpye=", a.type);
    a.click();
    window.URL.revokeObjectURL(url);
}

window.download =  function(filename){
        var filePath = getFilePath(filename)
        console.log("download ", filePath);
        runApi(function(stub, sid) {
            console.log("download MFOpenByPath sid:", sid, " filePath=", filePath); 
            stub.MFOpenByPath(sid, "mmroot", filePath, 0).then(function(mmfsid) {
            //console.log("MFOpenByPath ok mmfssid=", mmfsid)
            //读出文件类型，暂时串行执行
            stub.MFGetMimeType(mmfsid).then(function(mimeType){       
            //读出文件内容
            stub.MFGetData(mmfsid, 0, -1).then(function(fileData) {    
            //console.log("MFGetData ok");  
            downLoadByFileData(fileData, filename, mimeType)
            }, Catch)}, Catch)}, Catch)}
        );
    };
    
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
        ' id="myiframe" scrolling="no" frameborder="0"  width=></iframe>'

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

function showFile(stub, mmfsid, filePath){
//    console.log("showFile")
    //读出文件类型，暂时串行执行
    stub.MFGetMimeType(mmfsid).then(function(mimeType){   
        //这里加入文件方式
        var ext = filePath.substr(filePath.lastIndexOf('.')+1)
        console.log("mimeType= ", mimeType)
        if (mimeType=="video/mp4" || ['mp4','mkv','mov','avi','divx','wmv','flv'].includes(ext.toLowerCase())){
            objUrl = baseurl + "mf" + filePath + "?mmsid="+ mmfsid
            console.log("mimeType is video", objUrl);  
            strVideo = '<video controls autoplay style="width:100%" id= "media" name="media"><source src="' + objUrl+ '" type="video/mp4"> </video>'
            strVideo = strVideo + strinfo
            document.getElementById('LeitherBody').innerHTML = strVideo    
            //console.log("video ok html=", strVideo);  
            return
        } else if (mimeType=="image/jpeg"){
            objUrl = baseurl + "mf" + filePath + "?mmsid="+ mmfsid
            strImage = '<img style="width:100%" src="' + objUrl+ '">'
            strImage = strImage + strinfo
            document.getElementById('LeitherBody').innerHTML = strImage    
            return
        } else if (mimeType=="application/pdf") {
            objUrl = baseurl + "mf" + filePath + "?mmsid=" + mmfsid
            strImage = '<embed type="application/pdf" src="' + objUrl + '" style="min-height:100vh;width:100%"></embed>'
            strImage = strImage + strinfo
            document.getElementById('LeitherBody').innerHTML = strImage
            return
        }
        //读出文件内容
        stub.MFGetData(mmfsid, 0, -1).then(function(fileData) {
        showFileByFileData(fileData, mimeType)
    }, Catch)},Catch);
}

function showDir(stub, mmfsid){
    //console.log("showDir ", mmfsid);  
    //读取目录内容
    stub.MFReaddir(mmfsid).then(function(files) {
    //console.log("MFReaddir ok files=", files)
    var strFileList = "<pre>"
    files.forEach(function(file){                          
        //console.log("filename=",file.fName);  
        //console.log("file.isdir=", file.fIsDir)
        var href = "#" + getFilePath(file.fName)
        //console.log("href=", href);  
        if (file.fIsDir){
            strFileList = strFileList.concat('<a href="', href, '">'+ file.fName + '</a>\n')
        } else {            
            strDownload = '          <button style="display:none" onclick="window.download('+"'"+ file.fName+"'" +')">download</button>'
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
</script>

<template>
</template>
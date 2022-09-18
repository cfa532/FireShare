function f(){
    var p 
    function getParam() {              
        return p
    }
    window["getParam"] = getParam    
    // function initParam(){
    //     var bSameSubnet = false
    
    //     var p=window.getParam()
    //     for (i=0; i< p.ips.length; i++){
    //         var ip = p.ips[i].split(":")[0]
    //         if (ip == p.remote){
    //             bSameSubnet = true
    //             break
    //         }
    //     }
    //     for (i=0; i< p.ips.length; i++){
    //         var ip = p.ips[i].split(":")[0]        
    //         //如果是同一网络，返回局域网
    //         if (bSameSubnet && !isPubNetAddr(ip)){
    //             p.CurNode = i
    //             break
    //         }
    //         //如果不是同一网络,返回互联网
    //         if (!bSameSubnet && isPubNetAddr(ip)){
    //             p.CurNode = i
    //             break
    //         }
    //     }
    // }
    function initParam(){    
        var p=window.getParam()
        for (i=0; i< p.ips.length; i++){
            var ip = p.ips[i].split(":")[0]        
            //优先返回公网地址
            if (isPubNetAddr(ip)){
                p.CurNode = i
                break
            }
        }
    }

    //window["initParam"] = initParam
    window["setParam"] = function(param){
        p = param
        //window.initParam()
        initParam()
    }
    function isPubNetAddr(host){
        var f = host.split(".")[0]
        var ret =  f==10 || f==192 || f== 172
        return !ret
    }

    function getUrl(param, index) {
        url ="http://"+ param["ips"][index] +"/entry?"
        if (param["aid"] != ""){
            url += "aid="+ param["aid"] + "&"
        }
    
        if (param["mid"] != ""){
            url += "mid="+ param["mid"] + "&"
        }
    
        if (param["ver"] != ""){
            url += "ver="+ param["ver"] + "&"
        }
        
        url +=   "rand=" + Math.random()   
        return url

        // return  "http://"+ param["ips"][index] +"/entry?"
        //     + "appid="+ param["id"] + "&"    
        //     //+ "author=" + param["author"] +"&"
        //     //+ "app="+ param["app"] + "&"
        //     + "ver="+param["ver"] +  "&"
        //     + "mid="+param["mid"] +  "&"
        //     + "rand=" + Math.random()       
    }
    function requestUrl(url){
	    CurNodeUrl = url	
        var xhr = new XMLHttpRequest();
        if (xhr.withCredentials === undefined) {
            err = "XMLHttpRequest not support!"
            console.log(err)
            return err
        }
        xhr.onreadystatechange = function(){
            if (xhr.readyState == 4){
                if (xhr.status==200)  {// 200 = "OK"
                    var html = document.getElementById("LeitherHtml");          
                    var reg = /<html\s*\S*>([\s|\S]*)<\/html>/ig;
                    xhr.responseText.replace(reg, function() {                 
                        html.innerHTML = arguments[1]
                    });             
                    var regsrc = /<script[^>]*>([\s|\S]*?)<\/script>/igm;    
                    while ((result = regsrc.exec(xhr.responseText))!= null){
                        var script = document.createElement("script");
                        script.textContent = result[1]
                        document.getElementsByTagName("head")[0].appendChild(script);
                    }        
                }
                else{
    //                console.log("Problem retrieving XML data:" + xhr.statusText);
                }               
            }     
        }
        xhr.open("GET", url, true)    
        xhr.send(null)
    }
    function requestEntry() {        
        var url = getUrl(p, p.CurNode)
        console.log(url)
        return requestUrl(url)    
    }
    window["requestEntry"] = requestEntry    
}
f()

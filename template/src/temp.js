function f(){
    var p 
    window["getParam"] = ()=>{              
        return p
    }
    window["setParam"] = (param)=>{
        p = param
        //window.initParam()
        initParam()
    }
    function initParam(){    
        // get public IPv4, or v6 if no v4
        var p=window.getParam()
        for (i=0; i< p.ips.length; i++){
            var ip = p.ips[i].split(":")
            if (ip.length==2) {
                // IPv4 address, 1.172.121.64:4800
                var a = ip[0].split('.')
                if ( a[0]==10 || (a[0]==192 && a[1]==168) || (a[0]==172 && a[1>15 && a[1]<32])) {
                    // private IPv4 for sure
                    continue;
                } else {
                    // public IPv4
                    p.CurNode = i;
                    break;
                }
            } else {
                // public IPv6, [2001:b011:e608:33c7:497d:480:498:45b8]:4800"
                // private, fe80::3509:974:e443:8b8c
                var a = p.ips[i].replace(/\[|\]/g,'').split(':');
                if (a.length < 8) {
                    // private IPv6
                    continue;
                } else {
                    // public IPv6
                    p.CurNode = i 
                }
            }
        }
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
    }
    function fetchUrl(url) {
        fetch(url, {CurNodeUrl:url}).then(resp=>{
            if (!resp.ok) {
                throw new Error('HTTP error status: ${resp.status}');
            }
            return resp.text()
        }).then(txt=>{
            var html = document.getElementById("LeitherHtml");          
            var reg = /<html\s*\S*>([\s|\S]*)<\/html>/ig;
            txt.replace(reg, function() {                 
                    html.innerHTML = arguments[1]
            });             
            var regsrc = /<script[^>]*>([\s|\S]*?)<\/script>/igm;    
            while ((result = regsrc.exec(txt))!= null){
                var script = document.createElement("script");
                script.textContent = result[1]
                document.getElementsByTagName("head")[0].appendChild(script);
            }
        }).catch(r=>{
            console.log(r)
        })
    }
    function requestEntry() {        
        var url = getUrl(p, p.CurNode)
        return fetchUrl(url)
    }
    window["requestEntry"] = requestEntry    
}
f()
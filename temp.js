function f(){
	var request = []
	var RequestEnd //= false
    var param 
	//var TmRequest
  //  var addr2dis = new Map
    window["getParam"] = ()=>{
		return param    	
    }    
    window["setParam"] = (p)=>{
        param = p
    }
    function isPubNetAddr(host){
        var ip = host.split(":")
        if (ip.length < 3) {
            var a = ip[0].split('.')
            return !( a[0]==10 || (a[0]==192 && a[1]==168) || (a[0]==172 && a[1]>15 && a[1]<32)) 
        } 

         return !host.match(/^fe|^fc|^fd|::/i)
    }
	function getAddrs(){
		pubAddrs0 = []
		pubAddrs1 = []
		priAddrs = []
		
		//找出第一个外网地址
  	 	//for (i=0; i< param.addrs.length; i++){
		//	node = param.addrs[i]
		//	for (let node of param.addrs){
		param.addrs.forEach((node)=>{
			var addr = node[0][0]
			if (isPubNetAddr(addr)){
				//addr2dis[addr] = node[0][1]
				pubAddrs0.push(addr)				
			}
      		
      		for (j=1; j< node.length; j++){
				addr = node[j][0]
				//addr2dis[addr] = node[j][1]
				if (isPubNetAddr(addr)){
					pubAddrs1.push(addr)				
				}else{
					priAddrs.push(addr)
				}
      		}
    	})
    	return [...pubAddrs0, ...pubAddrs1, ...priAddrs]      
  	}
	
    function getUrl(addr) {
        var url ="http://"+ addr +"/entry?"
        if (param["aid"] != ""){
            url += "aid="+ param["aid"] + "&"
        }
    
        if (param["mid"] != ""){
            url += "mid="+ param["mid"] + "&"
        }
    
        if (param["ver"] != ""){
            url += "ver="+ param["ver"] + "&"
        }
        
        url += "rand=" + Math.random()   
        return url
    }
    
    function requestUrl(index, delay){
    	var addr = param.ips[index]
    	console.log("requestUrl", addr, delay)
	
    	var url = getUrl(addr)
    	var p = new Promise((resolve, reject) => {
			var f = () => {				
				if (RequestEnd){
					console.log("skip ", addr, delay, RequestEnd)
					return
				}
        		var xhr = new XMLHttpRequest();
				var begin = new Date(); 
				request[index].begin = begin;
				//console.log("show url", index, request[index].url)

        		xhr.onreadystatechange = ()=>{
        			if (xhr.readyState == 4){
            		    if (xhr.status==200)  {// 200 = "OK"
							//加一个成功标识
							console.log("onreadystatechange", addr, delay, RequestEnd)
							if (RequestEnd){
								return
							}
							RequestEnd = 1
							param.CurNode = index	//
            		 		replaceBody(xhr.responseText)
    						resolve(index)   
        		    	}
            		    else{
							request[index].tmFail = new Date() - begin
							
							//这里会发生网络错误 
							//net::ERR_CONNECTION_REFUSED
							//net::ERR_CONNECTION_TIMED_OUT
							//console.log("err", addr, delay, xhr.status, spend)
							console.log(xhr.statusText)
							//console.log(xhr)

            		   		reject(Error(xhr.statusText));
            		    }               
            		}/*else {
						console.log("onreadystatechange", xhr.readyState, xhr)
					}*/
        		}
				
				//console.log("GET", url, begin)
      			xhr.open("GET", url, true)    
        		xhr.send(null)	
        	}
			setTimeout(f, delay); //delay是0的情况就不优化了，认为setTimeout函数会处理好的
		});
		p.url = url
    	return p
    }
    
    function replaceBody(rtext){
    	var html = document.getElementById("LeitherHtml");          
        var reg = /<html\s*\S*>([\s|\S]*)<\/html>/ig;
        rtext.replace(reg, function(){                 
        	html.innerHTML = arguments[1]
        });
        var regsrc = /<script[^>]*>([\s|\S]*?)<\/script>/igm;    
        while ((result = regsrc.exec(rtext))!= null){
        var script = document.createElement("script");
        	script.textContent = result[1]
            document.getElementsByTagName("head")[0].appendChild(script);
        }            	
    }
    
    window["request"] = ()=>{//requestUrls    
    //function requestUrls(){
    	param.ips = getAddrs()

		if (param.ips.length == 0){
			show()
			return
		}

		var interval = 256//毫秒
		var delay = 0
    	RequestEnd = 0
		//TmRequest = new Date()
		for (i=0; i<param.ips.length; i++){
			var req = requestUrl(i, delay)
			request.push(req)
			
			delay += interval
			interval /= 2
		}
		if (request.length == 0){
			show()
			return
		}
		setTimeout(show, 2000) //多等2秒
		Promise.any(request).then((index)=>{
			console.log("requestUrls ok", index)
		}, (e)=>{
			console.log("requestUrls fail")
			RequestEnd = 2
			request.forEach((req, i)=>{
				var addr  = param.ips[i]
				if (req.tmFail< 50 && !isPubNetAddr(addr)){
					RequestEnd ++
				}
			})

//			for (i=0; i<request.length; i++){
//				var addr  = param.ips[i]
//				if (request[i].tmFail< 50 && !isPubNetAddr(addr)){
//					RequestEnd ++
//				}
//			}
			
			console.log(e)
		})
    }
    
    //显示界面
    function show(){
    	//console.log("show RequestEnd=", RequestEnd)
    	if (RequestEnd==1) {
			return
		}
    	//var spend = parseInt((new Date() - TmRequest)/1000)
    	//var str = 	`<body><p>Loading...... <a id="spend">`+ spend + `</a></p><table>`
		var str  
		if (param.ips.length == 0){
			str = `<body><p>没有可用的节点,也可能是缓存没有及时更新，可刷新页面进行更新</p></body>`
		} else {
			str = `<body><table>`   
			for (i=0; i<request.length; i++){
				str += getRequestHtml(i)
			}
		
			if (RequestEnd == 2){
				str += `</table><p>所有地址都不可访问</p></body>`					
			} else if (RequestEnd > 2){
				  str += `</table><p>有` + (RequestEnd-2) + `个内网地址未检查，应该是浏览器关闭了局域网地址自动跳转。</p><p>可点击链接手工跳转，或修改相关设置</p><p>浏览器输入以下链接调整：chrome://flags/#block-insecure-private-network-requests</p></body>`			
			} else {
				  str += `</table></body>`			
			}	
		}
    	document.getElementById("LeitherHtml").innerHTML =  str
		
    	if (RequestEnd) {
			return
		}
		
		//console.log("show end RequestEnd=", RequestEnd)
		setTimeout(show, 1000)
    }
    
    function getRequestHtml(index) {
    	var ret = `<tr><td>`
		var addr = param.ips[index] 
		var spend = 0
		var showUrl = true
		if (request[index].begin){
			if(request[index].tmFail) {
				spend = "请求失败"
			//	console.log("request[index].tmFail", request[index].tmFail)

				showUrl = (request[index].tmFail< 50) && !isPubNetAddr(addr)
				if (showUrl) {
					spend = "无法访问，可能是浏览器设置问题"
				}
				//console.log("showUrl", showUrl)
			} else {
		 		spend = parseInt((new Date() - request[index].begin)/1000)				
			}
		}
		if (showUrl){
			ret = ret + `<a href=` + request[index].url + `>` //链接			
		}
		//ret = ret + addr + `</td><td>`+ addr2dis[addr] + `</td><td>` + spend + `</td></tr>`
		ret = ret + addr + `</td><td>` + `</td><td>` + spend + `</td></tr>`
    	return ret
    }
}
f()

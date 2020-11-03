class Virhus {
    constructor(ip='', token) {
        this.token = token;
        this.events = {'data': [], 'freq': [], 'close': []};
        this.socket = io.connect(ip, { query: "token="+token });
        this.isRunning = false;
        this.ip = ip;
        this.socket.on('auth_sucess',function(user){
        	console.log("Login Successful")
        	console.log(user)
        })
        
    }

    isConnected(){
    	return this.socket.connected
    }


    connect(ip,token){
    	this.socket.disconnect()
    	this.token = token;
        this.ip = ip;
    	this.socket = io.connect(ip, { query: "token="+token });
        this.socket.on('auth_sucess',function(user){
        	console.log("Login Successful")
        	console.log(user)
        })
        

    }

    on(eventName,callback){
    	if(this.events[eventName]){
    		this.events[eventName].push(callback);
    	}
    }

    triggerHandler(eventName,params){
    	if(this.events[eventName]){
    		for(i in this.events[eventName]){
    			this.events[eventName][i](params)
    		}
    	}
    }
   
    get_configs(callback){
    	var output = []
    	if(this.socket.connected){
    		
    		$.get(this.ip+'/get_configs?token='+this.token,function(data){
			console.log(data);
			var i =0;
			for(i = 0; i<data.configs.length;i++)
				//$("#selected_config").append("<option>"+data.configs[i]+"</option>")
				output.push(data.configs[i])
			callback(output)
		})
    }
    	

    }

    get_config(name,callback){
    	var output=[]
    	if(this.socket.connect){
    		$.get(this.ip+'/get_config?token='+this.token+'&name='+name,function(data){
				console.log(data);
				
				callback(data)
			})
    	}
    	
    }

    downloadCSV(file){
    	window.location=this.ip+'/download_data?token='+this.token+'&file='+$("#getConfigSelect").val()
    }

    whoami(){
    	console.log(this.socket.connected)
    

    		this.socket.emit('whoami','',function(response){
    			if(String(response) !== 'null'){
    				alert("Hi "+response.id)
					console.log((typeof response))
    			}
				
    		})

    	
    }
    disconnect(){
        this.socket.disconnect();
    }
    play(){
    	if(this.socket.connected){
    		this.emit("play")
    	}
    }

    stop(){
    	
    	console.log("Stopped")
    }

    requestData(file){
    	this.socket.emit("graph"+this.token+"-"+file+"_requestData","temp");
    }

    playRecord(file){
    	var that = this;
    	var socket = this.socket;
    	this.isRunning = true;
    	this.socket.emit('playrecord',"graph"+this.token+"-"+file); // Tell server to start playing
    	this.socket.on("graph"+this.token+"-"+file+"_set_freq",function(data){
    		console.log(data)
    		if(that.events['freq']){
    			var i = 0;
    			for(i in that.events['freq']){
    				that.events['freq'][i](data);
    			}
    		}
    		setTimeout(function(){socket.emit("graph"+this.token+"-"+file+"_requestData","temp"); }, 3000);
    		
    	})

    	this.socket.on("graph"+this.token+"-"+file+"_valueData",function(data){
    		if(that.events['data']){
    			var i = 0;
    			for(i in that.events['data']){
    				that.events['data'][i](data);
    			}
    		}
    	})
    }

}
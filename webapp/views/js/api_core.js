$(document).ready(function(){

	var virhus = new Virhus();
	virhus.disconnect();
	virhus.on('freq',function(freq){
		console.log(freq);
		createGraphs();
		updater = setInterval(function() {
			virhus.requestData($("getConfigSelect").val());
			insert(data.shift());		
		}, freq/4);
	})

	virhus.on('data',function(_data){
		console.log(data);
		data = data.concat(_data);
	})

	virhus.on('close',function(data){
		console.log("finished")
	})

	$("#testToken").on('click',function(){
		token = $("#token").val();
		virhus.connect('',token)
		console.log(virhus)
		virhus.whoami();
		//virhus.play();
		

	});

	$(".example").on("click",function(){
		window.location='/example';
	})
	$("#testGetConfigs").on('click',function(){
		if(virhus.isConnected()){
			virhus.get_configs(function(configs){
				console.log(configs)
				$("#getConfigsSelect").html("")
				for(c in configs){
					
					$("#getConfigsSelect").append('<option>'+configs[c]+'</option>')
				}
			})

		}
	})
	$("#testGetConfig").on("click",function(){
		if(virhus.isConnected()){
			virhus.get_config($("#getConfigsSelect").val(),function(data){
				console.log(data)
				$("#getConfigSelect").html("")
				for(d in data.replays){
					
					$("#getConfigSelect").append('<option>'+data.replays[d]+'</option>')
				}

			})

			
		}
	})

	$("#testDownloadCSV").on("click",function(){
		
		if(virhus.isConnected())
			virhus.downloadCSV($("#getConfigSelect").val());
	})

	$("#testRunConfig").on('click',function(){
		if(virhus.isConnected() && !virhus.isRunning){


			virhus.playRecord($("#getConfigSelect").val())
			$('#myModal').modal('show')

		}else if(virhus.isRunning){
			virhus.stop()
		}
	})

	
})
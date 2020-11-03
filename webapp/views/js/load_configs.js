$(document).ready(function(){
	$.get('/get_configs',function(data){
		console.log(data);
		for(i = 0; i<data.configs.length;i++)
			$("#selected_config").append("<option>"+data.configs[i]+"</option>")
	})

	
})
$(document).ready(function(){
	$.get('/get_configs',function(data){
		console.log(data)
		$(".vh").html("Virtual Humans: "+data.configs.length)
		for(i in data.configs){
			row = parseInt(i)+1;
			$("tbody").append(' <tr><th scope="row">'+row+'</th><td>'+data.configs[i]+'</td><td>30KB</td><td>4</td><td>400KB</td></tr>');
		}
	
	})
	$.get('getAccountInfo',function(data){
		console.log(data)
		$(".space").html("Space Used: "+data.space)
	})
})
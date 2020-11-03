$(document).ready(function(){
	$.get('/systeminfo',function(data){
		console.log(data)
		$(".systeminfo").append('<div>Memory Available: '+data.systeminfo[1]+'KB<br>Total Data of Users: '+data.systeminfo[0]+'B<br> Users: '+data.n_users+'<br>Connections: '+data.total_connections+'<br>Requests: '+data.total_requests+'<br>Data Streamed: '+Math.floor(data.total_transfer/1000)+'KB</div>')
	})
})
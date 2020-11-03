$(document).ready(function(){
	//GET DATA THROUGH WEBSOCKETS
	var n = 0;
	var connections = []
	var socket = io('/',{ forceNew: true });
	var config = "config"
	var data = []
    $(".play").on("click",function(){
    	//worker(n);
    	 $('.chart_container').html(
		    '<div class="y_axis" id = "y_axis0" ></div><div class="demo_chart"  id = "demo_chart0" ></div>'
		  );
    	worker1();
    	//worker2()

    	

    })

    $(".stop").on("click",function(){
    	
    	socket.emit(config+"_stop","stop");
    	console.log("telling server to stop")
    	delete data
    	setTimeout(function()  {
		  $('#legend').empty();
		  $('.chart_container').html("");
		},3000);
    })


function worker1(n){
	
	var freq = 4;
	//var data =[];
	
	socket.on(config+"_set_freq",function(ffreq){
    	freq = parseFloat(ffreq);

    })

 	socket.on(config+'_value',function(value){
    		if(parseFloat(value) < 1.5 && parseFloat(value) > -0.5){ //Filter Mis interpreted data
      			 data.push(value)
      		}
      })

	if($("#config_file").val()==""){
    		socket.emit('play',"config");
    		
    	}
    	else{
    		socket.emit('play',$("#config_file").val());
    		
    	}
    console.log("Sent config file")
    console.log("Waiting 5 seconds")
    setTimeout(function(){
    	 		socket.emit('chat message', "Chart 0");
		    	 console.log("Sending a message")
		    	 console.log(freq)
		    	 console.log(data)

		    	 var updateInterval = 1000/freq;

					/* Rickshaw.js initialization */
					console.log(n)
					  var chart1 = new Rickshaw.Graph({
					  element: document.querySelector("#demo_chart0"),
					  width: "500",
					  height: "150",
					  renderer: "line",
					  min: "-0.5",
					  max: "1.5",
					  series: new Rickshaw.Series.FixedDuration(
					    [
					      {
					        name: "one",
					        color: "#EC644B"
					      }
					    ],
					    undefined,
					    {
					      timeInterval: updateInterval,
					      maxDataPoints: freq*4
					    }
					  )
					});

					var y_axis = new Rickshaw.Graph.Axis.Y({
					  graph: chart1,
					  orientation: "left",
					  tickFormat: function(y) {
					    return y.toFixed(2);
					  },
					  ticks: 2,
					  element: document.getElementById("y_axis0")
					});

					/* Timer function that is called every @updateInterval milliseconds*/
					/* Timer function that is called every @updateInterval milliseconds*/
					setInterval(function() {
					  insert(data.shift());
					}, updateInterval/4);

					/* Function that generates and inserts random datapoint into the chart */
					function insertRandomDatapoints(value) {
						if(value == null){
							console.log("Opps its empty, im faster than the server :)") // Incase the delay on > than what is being sent

						}
					 else if(parseFloat(value) < 1.5 && parseFloat(value) > -0.5){ //Filter Mis interpreted data
					  	let tmpData = {
						    one: parseFloat(value)
						  };
						 
						  //console.log(data.shift())
						  chart1.series.addData(tmpData);
						  chart1.render();
						}
					  }
					 function insert(value){
					 	let tmpData = {
						    one: parseFloat(value)
						  };
						 
						  //console.log(data.shift())
						  chart1.series.addData(tmpData);
						  chart1.render();
						}
    },5000)
   

}

function worker2(){
	var socket = io('/',{ forceNew: true });
	var freq = 4;
	var data =[];
	var config = "config2"
	 socket.on(config+"_set_freq",function(ffreq){
    	freq = parseFloat(ffreq);

    })

 	socket.on(config+'_value',function(value){
    		if(parseFloat(value) < 1.5 && parseFloat(value) > -0.5){ //Filter Mis interpreted data
      			 data.push(value)
      		}
      })

	if($("#config_file").val()==""){
    		socket.emit('play',"config2");
    		
    	}
    	else{
    		socket.emit('play',$("#config_file").val());
    		
    	}
    console.log("Sent config file")
    console.log("Waiting 5 seconds")
    setTimeout(function(){
    	 		socket.emit('chat message', "Chart 1");
		    	 console.log("Sending a message")
		    	 console.log(freq)
		    	 console.log(data)

		    	 var updateInterval = 1000/freq;

					/* Rickshaw.js initialization */
					console.log(n)
					  var chart1 = new Rickshaw.Graph({
					  element: document.querySelector("#demo_chart1"),
					  width: "500",
					  height: "150",
					  renderer: "line",
					  min: "-0.5",
					  max: "1.5",
					  series: new Rickshaw.Series.FixedDuration(
					    [
					      {
					        name: "one",
					        color: "#EC644B"
					      }
					    ],
					    undefined,
					    {
					      timeInterval: updateInterval,
					      maxDataPoints: freq*4
					    }
					  )
					});

					var y_axis = new Rickshaw.Graph.Axis.Y({
					  graph: chart1,
					  orientation: "left",
					  tickFormat: function(y) {
					    return y.toFixed(2);
					  },
					  ticks: 2,
					  element: document.getElementById("y_axis1")
					});

					/* Timer function that is called every @updateInterval milliseconds*/
					/* Timer function that is called every @updateInterval milliseconds*/
					setInterval(function() {
					  insert(data.shift());
					}, updateInterval/4);

					/* Function that generates and inserts random datapoint into the chart */
					function insertRandomDatapoints(value) {
						if(value == null){
							console.log("Opps its empty, im faster than the server :)") // Incase the delay on > than what is being sent

						}
					 else if(parseFloat(value) < 1.5 && parseFloat(value) > -0.5){ //Filter Mis interpreted data
					  	let tmpData = {
						    one: parseFloat(value)
						  };
						 
						  //console.log(data.shift())
						  chart1.series.addData(tmpData);
						  chart1.render();
						}
					  }
					 function insert(value){
					 	let tmpData = {
						    one: parseFloat(value)
						  };
						 
						  //console.log(data.shift())
						  chart1.series.addData(tmpData);
						  chart1.render();
						}
    },5000)
}

function worker(n){

		var socket1 = io(); // Connect to SOcket IO server
		var socket2 = io();
	   	var freq = 4;
	   	var freq2 = 4;
	   	var data = []
	   	var data2 = []
	   	var chart1 = ""
	   	var chart2 = ""
	   	var flag1 = 0
	   	var flag2 = 0
    	//socket.emit('play',"config");
    	
    	//$(".chart_container").html($(".chart_container").html()+'<div class="y_axis" id = "y_axis'+n+'" ></div><div class="demo_chart"  id = "demo_chart'+n+'" ></div>')
    	//$(".chart_container").append('<div class="y_axis" id = "y_axis'+n+'" ></div><div class="demo_chart"  id = "demo_chart'+n+'" ></div>')
    	if($("#config_file").val()==""){
    		socket1.emit('play',"config");
    		socket2.emit('play',"config");
    		console.log("config")
    	}
    	else{
    		socket1.emit('play',$("#config_file").val());
    		socket2.emit('play',$("#config_file").val());
    	}
    	
    	//socket.emit('chat message', "Testing 123");
    	

    	socket1.on('set_freq',function(ffreq){
	    	freq = parseInt(ffreq);
	    	if(flag1 == 0){
	    		console.log("Lets w8 5seconds")
	    	setTimeout(function(){kappa(parseInt(ffreq),n,socket1)}, 5000);
	    	flag1 = 1;
	    }else
	    	console.log("Its already running")
	    	
	    })


	     socket1.on('value',function(value){
    		if(parseFloat(value) < 1.5 && parseFloat(value) > -0.5){ //Filter Mis interpreted data
      			 data.push(value)
      		}
      	})

	     socket2.on('set_freq',function(ffreq){
	    	freq2 = parseInt(ffreq);
	    	if(flag2 == 0){
	    		console.log("Lets w8 5seconds")
	    	setTimeout(function(){kappa(parseInt(ffreq),1,socket2)}, 5000);
	    	flag2 = 1;
	    	}else
	    		console.log("Its already running")
	    	
	    })


	     socket2.on('value',function(value){
    		if(parseFloat(value) < 1.5 && parseFloat(value) > -0.5){ //Filter Mis interpreted data
      			 data2.push(value)
      		}
      	})

	    function kappa(freq,n,socket){
		    	
					 
					  
					
		    }


}




})


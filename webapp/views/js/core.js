$(document).ready(function(){
	var chart_number = 0;
	$(".showmodal").on("click",function(){
		$('#myModal').modal('show')
	})

	$(".importModal").on("click",function(){
		$('#importModal').modal('show')
	})

	$(".add").on("click",function(){
		// Default configs
		var config = ["-60.0 -15.0 0.0 15.0 110.0","1.2 -5.0 30.0 -7.5 0.5","0.15 0.1 0.1 0.1 0.3","500","64","64","0","60","0","0.1","0.25","0.01","0.01","0.5","1","200","100","100","0","neutral"];
		console.log($("#configName").val())
		name = $("#configName").val();
		if($.isNumeric($("#configHRPM").val()))
			config[7] = $("#configHRPM").val();
		//console.log($("#configHRPM").val())
		if($.isNumeric($("#configN").val()))
			config[3] = $("#configN").val();

		if($.isNumeric($("#configFreq").val())){
			config[4] = $("#configFreq").val();
			config[5] = $("#configFreq").val();
		}

		if($.isNumeric($("#configNoise").val()))
			config[6] = $("#configNoise").val();

		if($.isNumeric($("#configStim").val()))
			config[17] = $("#configStim").val();
		if($("#configName").val().length > 0){
			var exists = false;
			$('#selected_config option').each(function(){
			    if (this.value === $("#configName").val()) {
			        exists = true;
			        return false;
			    }
			});
			if(!exists){
				$("#selected_config").html("<option>"+$("#configName").val()+"</option>"+$("#selected_config").html())
				$.post("/config",
				  	{
				    name: $("#configName").val(),
				    configs: config
				  	},
				  	function(data, status){
				   	 console.log("Data: " + data + "\nStatus: " + status);
				 });
				main(config,name)
			}
			else{
				$('#myModal').modal('hide')
				$('.toast').toast('show')
				clear_fields();
			}
		}
		else {
			var exists = false;
			$('#selected_config option').each(function(){
				console.log(this.value)
			    if (this.value === 'Bob') {
			        exists = true;
			        return false;
			    }
			});
			if(!exists){
				$("#selected_config").html("<option>"+"Bob"+"</option>"+$("#selected_config").html())
					$.post("/config",
				  {
				    name: 'Bob',
				    configs: config
				  },
				  function(data, status){
				    console.log("Data: " + data + "\nStatus: " + status);
				 });

				main(config,name)
			}else{
				$('#myModal').modal('hide')
				$('.toast').toast('show')
				clear_fields();
			}
		}
	});

	$(".play").on("click",function(){
		console.log( "/get_config?name="+$("#selected_config").val());
		config = $("#selected_config").val();
		$.get("/get_config?name="+config,function(data){ // Get data related to config file, like replays and so on
			console.log(data)
			main(data.config,config,data.replays)
		})	
	})

	function clear_fields(){ // Wipe out modal fields and next uses
		$("#configName").val("")
		$("#configHRPM").val("")
		$("#configFreq").val("")
		$("#configN").val("")
		$("#configNoise").val("")
		$("#configStim").val("")
	}

	function main(config_values,name,replays=[]){
		$('#myModal').modal('hide')
		clear_fields();
		chart_number+=1;							// Identifier of a graphic here
		var temp = chart_number;					// Current graph ID, this ID is to create listerners for each respective graph
		var socket = io('/',{ forceNew: true });	// Connections to Socketio server
		var config = name;							// Config file selected
		var data = []								// published data from the server is stored
		var freq = 4;								// Frequency of data
		var chart_ECG = "";							// Graph handler
		var y_axis = "";							// Y axis handler
		var flag_pause = 0; 						// SIgnals paused or not
		var updater = "";   						// Task handler, This is a pointer to setInterval
		var updateInterval = 1000/freq; 			// Time between each unit of data, in ms
		var created = false;
		var flag_request = 0;						// Flag if graph is created
		var finished = 0;
		var running = 0;
		var chart_EMGZ = "";
		var chart_EMGM = "";
		var chart_EDA = "";
		var y_axis_EMGZ = "";
		var y_axis_EMGM = "";
		var y_axis_EDA = "";
		var other_data = []
		var fear = "150";
		var happy = "85";
		var neutral = "60";
		
		console.log(config_values)
		
		// Graph template, each graph identified by temp, ID
		$(".container-fluid").append("<div class='chart_container' id='chartID_"+temp+"'></div>");
		$("#chartID_"+temp).append('<div ><h3 class="left">'+name+'</h3></div>')
		$("#chartID_"+temp).append('<div class="graphic" id="graphicID_ECG_'+temp+'"><div>ECG</div><div class="y_axis" id = "y_axis_ECG_'+temp+'" ></div><div class="demo_chart"  id = "demo_chart_ECG_'+temp+'" ></div></div>');
		$("#chartID_"+temp).append('<div class="graphic" id="graphicID_EMGZ_'+temp+'"><div>EMGZ</div><div class="y_axis" id = "y_axis_EMGZ_'+temp+'" ></div><div class="demo_chart"  id = "demo_chart_EMGZ_'+temp+'" ></div></div>');
		$("#chartID_"+temp).append('<div class="graphic" id="graphicID_EMGM_'+temp+'"><div>EMGM</div><div class="y_axis" id = "y_axis_EMGM_'+temp+'" ></div><div class="demo_chart"  id = "demo_chart_EMGM_'+temp+'" ></div></div>');
		$("#chartID_"+temp).append('<div class="graphic" id="graphicID_EDA_'+temp+'"><div>EDA</div><div class="y_axis" id = "y_axis_EDA_'+temp+'" ></div><div class="demo_chart"  id = "demo_chart_EDA_'+temp+'" ></div></div>');
		$("#chartID_"+temp).append('<div class="button_container"><span id="playID_'+temp+'" class="btn btn-success">Play <i class="fas fa-play"></i></span><span id="stopID_'+temp+'" class="btn btn-danger ">Stop <i class="fas fa-stop"></i></span><span id="pauseID_'+temp+'" class="btn btn-warning ">Pause <i class="fas fa-pause"></i></span><span id="closeID_'+temp+'" class="btn btn-secondary close_graphic"><i class="fas fa-times"></i></span><ul class="nav nav-pills "   role="tablist"><li  class="nav-item"><a class="nav-link" id="stimID_N_'+temp+'" data-toggle="pill" href="#" role="tab" aria-controls="pills-home" aria-selected="true">Neutral</a></li><li class="nav-item"><a class="nav-link" id="stimID_H_'+temp+'" data-toggle="pill" href="#" role="tab" aria-controls="pills-profile" aria-selected="false">Happy</a></li><li class="nav-item"><a class="nav-link" id="stimID_F_'+temp+'" data-toggle="pill" href="#" role="tab" aria-controls="pills-contact" aria-selected="false">Fear</a></li></ul></div><div class="button_container"><select  class="form-control selected_config" id="selected_replayID_'+temp+'"></select><span class="btn btn-secondary" id="playrecordID_'+temp+'">Play Record</span><span class="btn btn-secondary" id="csvID_'+temp+'">CSV <i class="fas fa-download"></i></span><span class="btn btn-secondary" id="metadataID_'+temp+'">Metadata <i class="fas fa-download"></i></span></div>');
		
		// Adding replay files to dropdown 
		for(i = 0;i<replays.length;i++){
			$("#selected_replayID_"+temp).append("<option>"+replays[i]+"</option>")
		}

		switch(config_values[19]){
			case "fear":{
				$("#stimID_F_"+temp).addClass("active");
				break;
			}

			case "happy":{
				$("#stimID_H_"+temp).addClass("active");
				break;
			}
			default:{
				$("#stimID_N_"+temp).addClass("active");
			}
		}
		//Button Listeners
		// Stop, disconnects Socket io client from server, stops drawing data
		$("#stopID_"+temp).on("click",function(){
			socket.emit("graph"+temp+"-"+config+"_stop","stop");
			data.length = 0;
			running = 0;
			flag_pause = 0;
			socket.disconnect();
			clearInterval(updater)
		})

		//Replay record of config file
		$("#playrecordID_"+temp).on("click",function(){
			finished =0;
			if(!socket.connected)
				socket = io('/',{ forceNew: true });

			config = $("#selected_replayID_"+temp).val();
			if(running == 0){
				running = 1;
				socket.emit('playrecord',"graph"+temp+"-"+config); // Tell server to start playing
				
				//Set freq and create graph
				socket.on("graph"+temp+"-"+config+"_set_freq",function(ffreq){ // Here the graph is immediately created after receiving Frequency

		    		freq = parseFloat(ffreq); // 
		    		updateInterval = 1000/freq; // Setting graph update interval
		    		console.log(ffreq)
		    		if(created){
		    			refreshGraphs();
		    			setTimeout(function(){	
								updater = setInterval(function() {
								if(data.length == 0){
									socket.emit("graph"+temp+"-"+config+"_finished?","temp",function(response){
										//console.log(response)
										if(response == 'yes')
											setTimeout(function(){AreWeDone()},freq);
									})
								}
								if(data.length < freq){
									
									//console.log("I need more data")
									if(flag_request == 0 || data.length % 5 == 0){
										flag_request = 1;
										
											socket.emit("graph"+temp+"-"+config+"_requestData","happy")
										
									}
									
								}else
									flag_request = 0;
								if(flag_pause == 0)
									insert(data.shift());
								else
									console.log("Im paused :)") // Incase the delay on > than what is being sent

							}, updateInterval/4);
						},200)
					}
		    		else
		    			setTimeout(function(){worker()},200);
		    		//console.log(chart1)
	    		})

				//Old data handler, nows its valueData
				socket.on("graph"+temp+"-"+config+'_value',function(value){
	    			if(parseFloat(value) < 1.5 && parseFloat(value) > -0.5){ //Filter Mis interpreted data
	      				 data.push(value)
	      			}
	      			//console.log("Pushing data")
	      		})

				//Add values to data;
	      		socket.on("graph"+temp+"-"+config+'_valueData', function(value){

					data = data.concat(value)

	      		})

	      		// Server telling the client its finished
	      		socket.on("graph"+temp+"-"+config+'_done', function(value){
	      			//finished = 1;
	      			//console.log("done")
	      		//	clearInterval(updater)
	      			//socket.disconnect();
	      		})
	      	}
		})

		//CSV Export
		$("#csvID_"+temp).on("click",function(){
			window.location='/download_data?file='+$("#selected_replayID_"+temp).val()
			//$.fileDownload().done(console.log("done"))
		})

		$("#metadataID_"+temp).on("click",function(){
			window.location='/get_metadata?file='+config;
			//$.fileDownload().done(console.log("done"))
		})

		// Pause data INCOMPLETE
		$("#pauseID_"+temp).on("click",function(){
			if(flag_pause == 0){
				flag_pause = 1;
				clearInterval(updater)
			}
			else{
				flag_pause = 0;
				updater = setInterval(function() {
					if(data.length == 0){
					socket.emit("graph"+temp+"-"+config+"_finished?","temp",function(response){
						console.log(response)
						if(response == 'yes')
							setTimeout(function(){AreWeDone()},freq);
					})
				}
				if(data.length < freq){
					
					//console.log("I need more data")
					if(flag_request == 0 || data.length % 5 == 0){
						flag_request = 1;
						
							socket.emit("graph"+temp+"-"+config+"_requestData","happy")
						
					}
					
				}else
					flag_request = 0;
				if(flag_pause == 0)
					insert(data.shift(),other_data.shift());
				else
					console.log("Im paused :)") // Incase the delay on > than what is being sent
				}, updateInterval/4);
			}
			console.log(flag_pause)
		})

		// Plays current config selected
		$("#playID_"+temp).on("click",function(){
			if(!socket.connected)
				socket = io('/',{ forceNew: true });

			config = $("#selected_config").val();
			if(running == 0){
				running = 1;
				socket.emit('play',{name:"graph"+temp+"-"+config,emotion:config_values[19]});

				socket.on("graph"+temp+"-"+config+"_set_freq",function(ffreq){
		    		freq = parseFloat(ffreq);
		    		updateInterval = 1000/freq;
		    		console.log(ffreq)
		    		if(created){
		    			refreshGraphs();
		    			setTimeout(function(){	
							updater = setInterval(function() {
								if(data.length == 0){
									socket.emit("graph"+temp+"-"+config+"_finished?","temp",function(response){
										//console.log(response)
										if(response == 'yes')
											setTimeout(function(){AreWeDone()},freq);
									})
								}
								if(data.length < freq){
									console.log("I need more data")
									if(flag_request == 0 || data.length % 5 == 0){
										flag_request = 1;
										if(finished == 0)
											socket.emit("graph"+temp+"-"+config+"_requestData","happy")
										else if (data.length == 0)
											clearInterval(update);
									}
									
								}else
									flag_request = 0;

								if(flag_pause == 0)
									insert(data.shift(),other_data.shift());
								else
									console.log("Im paused :)") // Incase the delay on > than what is being sent
							}, updateInterval/4);
						},200)
					}
		    		else
		    			setTimeout(function(){worker()},200);
		    		console.log(chart_ECG)
	    		})

			//Old data handler, its now valueData
			socket.on("graph"+temp+"-"+config+'_value',function(value){
	    		if(parseFloat(value) < 1.5 && parseFloat(value) > -0.5){ //Filter Mis interpreted data
	      			 data.push(value)
	      		}
	      		//console.log("Pushing data")
	      	})

			//Data handler
	      	socket.on("graph"+temp+"-"+config+'_valueData', function(value){
	      		if(value.ecg.length > 0 && value.other.length>0)
	      		console.log(value)
	      		
	      		data = data.concat(value.ecg)
	      		other_data = other_data.concat(value.other)
	      	})

	      	//Server telling the client its finished
	      	socket.on("graph"+temp+"-"+config+'_done', function(value){
	      		//finished = 1;
	      		console.log("done")
		      	//	clearInterval(updater)
		      	//	socket.disconnect();
	      	})
	      	}
		})

		//Destroys graph and this entire
		$("#closeID_"+temp).on("click",function(){
			socket.emit("graph"+temp+"-"+config+"_stop","stop");
			$(this).parent().parent().remove();
			console.log(temp)
			socket.disconnect();
			clearInterval(updater);
			flag_paused=0;
			delete socket;
			delete data;
			delete config;
			delete chart_ECG;
			delete y_axis;
		})

		//Activate stimulation
		$("#stimID_N_"+temp).on("click",function(){
			//config_values="600";
			if($(this).hasClass("active"))
				console.log("Im already neutral")
			config_values[7] = neutral;
			config_values[19]="neutral"
			if(created){
				console.log(chart_ECG.series.currentIndex)
				console.log(chart_ECG.series.currentIndex % freq)
			}
			if(running == 1)
			socket.emit("graph"+temp+"-"+config+"_stimulation",{config:config_values,emotion: "fear"})
			else{
				$.post("/config",
				  	{
				    name: name,
				    configs: config_values
				  	},
				  	function(data, status){
				   	 console.log("Data: " + data + "\nStatus: " + status);
				 });
			}
			console.log(config_values)
			//socket.emit("graph"+temp+"-"+config+"_stop","happy")
			//socket.emit("graph"+temp+"-"+config+"_requestData","happy")
			console.log(data.length)
			if(data.length>freq){
				//data = data.slice(0,(chart1.series.currentIndex % freq)+freq+1);
			}
		})

		$("#stimID_H_"+temp).on("click",function(){
			//config_values="600";
			if($(this).hasClass("active"))
				console.log("Im already Happy")
			config_values[7]=happy;
			config_values[19]="happy"
			if(created){
				console.log(chart_ECG.series.currentIndex)
				console.log(chart_ECG.series.currentIndex % freq)
			}
			if(running == 1)
			socket.emit("graph"+temp+"-"+config+"_stimulation",{config:config_values,emotion: "happy"})
			else{
				$.post("/config",
				  	{
				    name: name,
				    configs: config_values
				  	},
				  	function(data, status){
				   	 console.log("Data: " + data + "\nStatus: " + status);
				 });
			}
			console.log(config_values)
			//socket.emit("graph"+temp+"-"+config+"_stop","happy")
			//socket.emit("graph"+temp+"-"+config+"_requestData","happy")
			console.log(data.length)
			if(data.length>freq){
				//data = data.slice(0,(chart1.series.currentIndex % freq)+freq+1);
			}
		})

		$("#stimID_F_"+temp).on("click",function(){
			//config_values="600";
			if($(this).hasClass("active"))
				console.log("Im already Fear")
			config_values[7]=fear;
			config_values[19]="fear"
			if(created){
				console.log(chart_ECG.series.currentIndex)
				console.log(chart_ECG.series.currentIndex % freq)
			}
			if(running == 1)
			socket.emit("graph"+temp+"-"+config+"_stimulation",{config:config_values,emotion: "fear"})
			else{
				$.post("/config",
				  	{
				    name: name,
				    configs: config_values
				  	},
				  	function(data, status){
				   	 console.log("Data: " + data + "\nStatus: " + status);
				 });
			}
			console.log(config_values)
			//socket.emit("graph"+temp+"-"+config+"_stop","happy")
			//socket.emit("graph"+temp+"-"+config+"_requestData","happy")
			console.log(data.length)
			if(data.length>freq){
				//data = data.slice(0,(chart1.series.currentIndex % freq)+freq+1);
			}
		})

		// Worker creates a graphical image for the first time LEFT OFFF HERE CLEAN
		function worker(){
			//socket.emit('chat message', "Chart 0");
		   	//console.log("Sending a message")
		   	console.log(freq)
		   // console.log(data)
		    //console.log(new Rickshaw.Series())
			updateInterval = 1000/freq; // Defining graphic update frequency
 			
			/* Rickshaw.js initialization */
		
			createGraphs();
				
			console.log(chart_ECG.series)
			created = true;
			/* Timer function that is called every @updateInterval milliseconds*/
			/* Timer function that is called every @updateInterval milliseconds*/
			updater = setInterval(function() {
				
				if(data.length < freq){
					
					//console.log("I need more data")
					if(flag_request == 0 || data.length % 5 == 0){
						flag_request = 1;
						
							socket.emit("graph"+temp+"-"+config+"_requestData","happy")
						
					}
					
				}else
					flag_request = 0;
				if(flag_pause == 0)
					insert(data.shift(),other_data.shift());
				else
					console.log("Im paused :)") // Incase the delay on > than what is being sent
			}, updateInterval/4);
		}

		// insert adds values to the created graph
		function insert(ecgValue,other){
			//console.log(ecgValue)
			if(typeof other !== 'undefined'){
			//console.log(other)

				var tmpOther = other.split(",")
			if(parseFloat(ecgValue) < 1.5 && parseFloat(ecgValue) > -0.5 && parseFloat(tmpOther[0])<1.0 && parseFloat(tmpOther[0]) > -1.0 && parseFloat(tmpOther[1]) < 1.0 && parseFloat(tmpOther[1])>-1.0 && parseFloat(tmpOther[2])<2.0 && parseFloat(tmpOther[2])>0){ //Filter Mis interpreted data
				
				let ecg = {
					one: parseFloat(ecgValue)
				};

				let emgz = {
					one: parseFloat(tmpOther[0])
				};

				let emgm = {
					one: parseFloat(tmpOther[1])
				};

				let eda = {
					one: parseFloat(tmpOther[2])
				};
						 
				//console.log(data.shift())
				chart_ECG.series.addData(ecg);
				chart_EMGZ.series.addData(emgz)
				chart_EMGM.series.addData(emgm)
				chart_EDA.series.addData(eda)

				chart_ECG.series.dropData();
				chart_EMGZ.series.dropData();
				chart_EMGM.series.dropData();
				chart_EDA.series.dropData();

				chart_ECG.render();
				chart_EMGM.render();
				chart_EMGZ.render();
				chart_EDA.render();



				if(data.length == 0){
					socket.emit("graph"+temp+"-"+config+"_finished?","temp",function(response){
						console.log(response)
						if(response == 'yes')
							setTimeout(function(){AreWeDone()},freq);
					})
				}	
			}
			}else if(typeof ecgValue !== 'undefined'){
				var tmpOther = ecgValue.split(",")
				if(parseFloat(tmpOther[0]) < 1.5 && parseFloat(tmpOther[0]) > -0.5 && parseFloat(tmpOther[1])<1.0 && parseFloat(tmpOther[1]) > -1.0 && parseFloat(tmpOther[2]) < 1.0 && parseFloat(tmpOther[2])>-1.0 && parseFloat(tmpOther[3])<2.0 && parseFloat(tmpOther[3])>0){ //Filter Mis interpreted data
				
				let ecg = {
					one: parseFloat(tmpOther[0])
				};

				let emgz = {
					one: parseFloat(tmpOther[1])
				};

				let emgm = {
					one: parseFloat(tmpOther[2])
				};

				let eda = {
					one: parseFloat(tmpOther[3])
				};
						 
				//console.log(data.shift())
				chart_ECG.series.addData(ecg);
				chart_EMGZ.series.addData(emgz)
				chart_EMGM.series.addData(emgm)
				chart_EDA.series.addData(eda)

				chart_ECG.series.dropData();
				chart_EMGZ.series.dropData();
				chart_EMGM.series.dropData();
				chart_EDA.series.dropData();

				chart_ECG.render();
				chart_EMGM.render();
				chart_EMGZ.render();
				chart_EDA.render();



				if(data.length == 0){
					socket.emit("graph"+temp+"-"+config+"_finished?","temp",function(response){
						console.log(response)
						if(response == 'yes')
							setTimeout(function(){AreWeDone()},freq);
					})
				}
			}
		}

		}
		function createGraphs(){
			
			chart_ECG = new Rickshaw.Graph({
				element: document.querySelector("#demo_chart_ECG_"+temp),
				width: ($("#demo_chart_ECG_"+temp).width() - 55),
				height: "100",
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
			})

			y_axis_ECG = new Rickshaw.Graph.Axis.Y({
				graph: chart_ECG,
				orientation: "left",
				
				tickFormat: function(y) {
					return y.toFixed(2);
				},
				ticks: 2,
				element: document.getElementById("y_axis_ECG_"+temp)
			});
			//console.log(y_axis_ECG);
			
			chart_EMGZ = new Rickshaw.Graph({
				element: document.querySelector("#demo_chart_EMGZ_"+temp),
				width: ($("#demo_chart_EMGZ_"+temp).width() - 55),
				height: "100",
				renderer: "line",
				min: "-0.5",
				max: "0.5",
				series: new Rickshaw.Series.FixedDuration(
					[
					 {
					    name: "one",
					    color: "#BDB76B"
					 }
					],
					  undefined,
					 {
					  timeInterval: updateInterval,
					  maxDataPoints: freq*4
					 }
				)
			})

			y_axis_EMGZ = new Rickshaw.Graph.Axis.Y({
				graph: chart_EMGZ,
				orientation: "left",
				tickFormat: function(y) {
					return y.toFixed(2);
				},
				ticks: 2,
				element: document.getElementById("y_axis_EMGZ_"+temp)
			});

			chart_EMGM = new Rickshaw.Graph({
				element: document.querySelector("#demo_chart_EMGM_"+temp),
				width: ($("#demo_chart_EMGM_"+temp).width() - 55),
				height: "100",
				renderer: "line",
				min: "-0.25",
				max: "0.25",
				series: new Rickshaw.Series.FixedDuration(
					[
					 {
					    name: "one",
					    color: "#32CD32"
					 }
					],
					  undefined,
					 {
					  timeInterval: updateInterval,
					  maxDataPoints: freq*4
					 }
				)
			})

			y_axis_EMGM = new Rickshaw.Graph.Axis.Y({
				graph: chart_EMGM,
				orientation: "left",
				tickFormat: function(y) {
					return y.toFixed(2);
				},
				ticks: 2,
				element: document.getElementById("y_axis_EMGM_"+temp)
			});

			chart_EDA = new Rickshaw.Graph({
				element: document.querySelector("#demo_chart_EDA_"+temp),
				width: ($("#demo_chart_EDA_"+temp).width() - 55),
				height: "100",
				renderer: "line",
				min: "-0.5",
				max: "2.0",
				series: new Rickshaw.Series.FixedDuration(
					[
					 {
					    name: "one",
					    color: "#1E90FF"
					 }
					],
					  undefined,
					 {
					  timeInterval: updateInterval,
					  maxDataPoints: freq*4
					 }
				)
			})

			y_axis_EDA = new Rickshaw.Graph.Axis.Y({
				graph: chart_EDA,
				orientation: "left",
				tickFormat: function(y) {
					return y.toFixed(2);
				},
				ticks: 2,
				element: document.getElementById("y_axis_EDA_"+temp)
			});

		}

		function refreshGraphs(){
			chart_ECG.setSeries(new Rickshaw.Series.FixedDuration(
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
						))

			chart_EMGZ.setSeries(new Rickshaw.Series.FixedDuration(
							[
						 	  {
						   	   name: "one",
						   	   color: "#BDB76B"
						   	 }
							],
							undefined,
							{
							    timeInterval: updateInterval,
							    maxDataPoints: freq*4
							}
						))
			chart_EMGM.setSeries(new Rickshaw.Series.FixedDuration(
							[
						 	  {
						   	   name: "one",
						   	   color: "#32CD32"
						   	 }
							],
							undefined,
							{
							    timeInterval: updateInterval,
							    maxDataPoints: freq*4
							}
						))
			chart_EDA.setSeries(new Rickshaw.Series.FixedDuration(
							[
						 	  {
						   	   name: "one",
						   	   color: "#1E90FF"
						   	 }
							],
							undefined,
							{
							    timeInterval: updateInterval,
							    maxDataPoints: freq*4
							}
						))
		    			chart_ECG.render(); //
		    			chart_EMGZ.render(); //
		    			chart_EMGM.render(); //
		    			chart_EDA.render(); //
		}
		function AreWeDone(){
			socket.emit("graph"+temp+"-"+config+"_finished?","temp",function(response){
						console.log(response)
						if(response == 'yes' && data.length < 1 && running == 1){
							data.length = 0;
							running = 0;
						
							socket.emit("graph"+temp+"-"+config+"_stop","stop");
							socket.disconnect();
							clearInterval(updater)

						}
				})
		}
	}
})
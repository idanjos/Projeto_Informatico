	var chart_EMGZ = "";
	var chart_EMGM = "";
	var chart_EDA = "";
	var y_axis_EMGZ = "";
	var y_axis_EMGM = "";
	var y_axis_EDA = "";
	var data = []
	var updateInterval = 128/4;
	var freq = 128;
	function createGraphs(temp=0){
				$(".modal-content").append("<div class='chart_container' id='chartID_"+temp+"'></div>");
				$("#chartID_"+temp).append('<div ><h3 class="left">'+$("#getConfigSelect").val()+'</h3></div>')
				$("#chartID_"+temp).append('<div class="graphic" id="graphicID_ECG_'+temp+'"><div>ECG</div><div class="y_axis" id = "y_axis_ECG_'+temp+'" ></div><div class="demo_chart"  id = "demo_chart_ECG_'+temp+'" ></div></div>');
				$("#chartID_"+temp).append('<div class="graphic" id="graphicID_EMGZ_'+temp+'"><div>EMGZ</div><div class="y_axis" id = "y_axis_EMGZ_'+temp+'" ></div><div class="demo_chart"  id = "demo_chart_EMGZ_'+temp+'" ></div></div>');
				$("#chartID_"+temp).append('<div class="graphic" id="graphicID_EMGM_'+temp+'"><div>EMGM</div><div class="y_axis" id = "y_axis_EMGM_'+temp+'" ></div><div class="demo_chart"  id = "demo_chart_EMGM_'+temp+'" ></div></div>');
				$("#chartID_"+temp).append('<div class="graphic" id="graphicID_EDA_'+temp+'"><div>EDA</div><div class="y_axis" id = "y_axis_EDA_'+temp+'" ></div><div class="demo_chart"  id = "demo_chart_EDA_'+temp+'" ></div></div>');
		
			
				chart_ECG = new Rickshaw.Graph({
				element: document.querySelector("#demo_chart_ECG_"+temp),
				width: ($("#chart_container").width() - 55),
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
				width: ($("#chart_container").width() - 55),
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
				width: ($("#chart_container").width() - 55),
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
				width: ($("#chart_container").width() - 55),
				height: "100",
				renderer: "line",
				min: "-0.5",
				max: "1.5",
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



				
			}
			}
		}

$(document).ready(function(){
	/* Rickshaw real-time data visualization (UNOPTIMIZED)*/

	var updateInterval = 50;

	/* Rickshaw.js initialization */
	var chart1 = new Rickshaw.Graph({
	  element: document.querySelector("#demo_chart"),
	  width: "500",
	  height: "150",
	  renderer: "line",
	  min: "0",
	  max: "70",
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
	      maxDataPoints: 100
	    }
	  )
	});

	var y_axis = new Rickshaw.Graph.Axis.Y({
	  graph: chart1,
	  orientation: "left",
	  tickFormat: function(y) {
	    return y.toFixed(1);
	  },
	  ticks: 2,
	  element: document.getElementById("y_axis")
	});

	/* Timer function that is called every @updateInterval milliseconds*/
	setInterval(function() {
	  insertRandomDatapoints();
	}, updateInterval);

	/* Function that generates and inserts random datapoint into the chart */
	function insertRandomDatapoints() {
	  let tmpData = {
	    one: Math.floor(Math.random() * 35) + 10
	  };

	  chart1.series.addData(tmpData);
	  chart1.render();
	}

});
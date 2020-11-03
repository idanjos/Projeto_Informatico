$(document).ready(function(){
	console.log("Hello world")
	raw_data = []
	$.getJSON( "/test", function( data ) {
		 console.log(data.raw[data.raw.length-1]);
		 freq = parseInt(data.raw[data.raw.length-1]);
		 length = data.raw.length;
		  alert( "Load was performed." );
		  raw = data.raw;
		  console.log(raw)
	  // Themes begin
		am4core.useTheme(am4themes_animated);
		// Themes end

		var chart = am4core.create("chartdiv", am4charts.XYChart);

		var data = [];
		
		for(let i = 0; i < freq*5; i++){
	  		
	 		 data.push({"timeframe":i/freq, "value": parseFloat(raw[i])});
		}

		chart.data = data;
		console.log(chart.data)
		var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
		categoryAxis.dataFields.category = "timeframe";
		categoryAxis.renderer.minGridDistance = 50;
		categoryAxis.renderer.grid.template.location = 0.5;
		categoryAxis.startLocation = 0.5;
		categoryAxis.endLocation = 0.5;
		
		// Pre zoom
		

		// Create value axis
		var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
		valueAxis.baseValue = 0;

		// Create series
		var series = chart.series.push(new am4charts.LineSeries());
		series.dataFields.valueY = "value";
		series.dataFields.categoryX = "timeframe";
		series.strokeWidth = 2;
		series.tensionX = 0.77;

		var range = valueAxis.createSeriesRange(series);
		range.value = 0;
		range.endValue = 1000;
		range.contents.stroke = am4core.color("#FF0000");
		range.contents.fill = range.contents.stroke;

		// Add scrollbar
		var scrollbarX = new am4charts.XYChartScrollbar();
		scrollbarX.series.push(series);
		chart.scrollbarX = scrollbarX;

		chart.cursor = new am4charts.XYCursor();
		
		chart.numberFormatter.numberFormat = "#.";


	});







})
function RadarChart(id, data, options) {
	var cfg = {
		w: 600,
		h: 600,
		margin: {
			top: 20,
			right: 20,
			bottom: 20,
			left: 20
		},
		levels: 3,
		maxValue: 0,
		labelFactor: 1.3,
		wrapWidth: 80,
		opacityArea: 0.8,
		dotRadius: 3, 
		opacityCircles: 0.15, 
		strokeWidth: 1, 
		strokeOpacity: 0.8,
		roundStrokes: false,
		color: d3.schemeCategory10 
	};

	// Group data by Country
	var getGrouped = d3.nest()
		.key(function (d) {
			return d.country;
		})
		.entries(data);

	//Put all of the options into a variable called cfg
	if ('undefined' !== typeof options) {
		for (var i in options) {
			if ('undefined' !== typeof options[i]) {
				cfg[i] = options[i];
			}
		}
	}

	var maxValue = 1
	var allAxis = [data[0].indicator, data[1].indicator, data[2].indicator, data[3].indicator, data[4].indicator] //Names of each axis
	total = allAxis.length, //The number of different axes
		radius = Math.min(cfg.w / 2, cfg.h / 2), //Radius of the outermost circle
		Format = d3.format('.2n'), //Percentage formatting
		angleSlice = Math.PI * 2 / total; //The width in radians of each "slice"

	//Scale for the radius
	var rScale = d3.scaleLinear()
		.range([0, radius])
		.domain([0, maxValue]);


	//Create the container SVG and g 

	//Initiate the radar chart SVG
	var svg = d3.select(id).append("svg")
		.attr("width", cfg.w + cfg.margin.left + cfg.margin.right)
		.attr("height", cfg.h + cfg.margin.top + cfg.margin.bottom)
		.attr("class", "radar" + id);
	
	//Append a g element		
	var g = svg.append("g")
		.attr("transform", "translate(" + (cfg.w / 2 + cfg.margin.left) + "," + (cfg.h / 2 + cfg.margin.top) + ")");


	//Draw the Circular grid

	//Wrapper for the grid & axes
	var axisGrid = g.append("g").attr("class", "axisWrapper");

	//Draw the background circles
	axisGrid.selectAll(".levels")
		.data(d3.range(1, (cfg.levels + 1)).reverse())
		.enter()
		.append("circle")
		.attr("class", "gridCircle")
		.attr("r", function (d, i) {
			return radius / cfg.levels * d;
		})
		.style("fill", "#ffffff")
		.style("fill-opacity", cfg.opacityCircles)

	//Draw the axes

	//Create the straight lines radiating outward from the center
	var axis = axisGrid.selectAll(".axis")
		.data(allAxis)
		.enter()
		.append("g")
		.attr("class", "axis");

	//Text indicating at what % each level is
	axisGrid.selectAll(".axisLabel")
		.data(d3.range(cfg.levels + 1))
		.enter().append("text")
		.attr("class", "axisLabel")
		.attr("x", 4)
		.attr("y", function (d) {
			return -d * radius / cfg.levels;
		})
		.attr("dy", "0.4em")
		.style("font-size", "10px")
		.attr("fill", "#737373")
		.text(function (d, i) {
			return Format(1 * d / cfg.levels);
		});

	//Append the lines
	axis.append("line")
		.attr("x1", 0)
		.attr("y1", 0)
		.attr("x2", function (d, i) {
			return rScale(maxValue * 1.1) * Math.cos(angleSlice * i - Math.PI / 2);
		})
		.attr("y2", function (d, i) {
			return rScale(maxValue * 1.1) * Math.sin(angleSlice * i - Math.PI / 2);
		})
		.attr("class", "line")
		.style("stroke", "white")
		.style("stroke-width", "1px");

	//Append the labels at each axis
	axis.append("text")
		.attr("class", "indicators")
		.style("font-size", "2vh")
		.attr("text-anchor", "middle")
		.attr("dy", "0.35em")
		.attr("x", function (d, i) {
			return rScale(maxValue * cfg.labelFactor) * Math.cos(angleSlice * i - Math.PI / 2);
		})
		.attr("y", function (d, i) {
			return rScale(maxValue * cfg.labelFactor) * Math.sin(angleSlice * i - Math.PI / 2);
		})
		.text(function (d) {
			return d
		})
		.call(wrap, cfg.wrapWidth);

	//The radial line function
	var radarLine = d3.lineRadial()
		.curve(d3.curveLinearClosed)
		.radius(function (d) {
			return rScale(d.value);
		})
		.angle(function (d, i) {
			return i * angleSlice;
		});

	if (cfg.roundStrokes) {
		radarLine.curve(d3.curveCardinalClosed);
	}

	//Draw the radar chart blobs

	//allBlobWrappers
	var allBlobWrappers = g.selectAll('.blobWrapper') 
		.data(getGrouped)
		.enter()
		.append('g')
		.attr('class', 'blobWrapper')
		.attr('display', 'none')

	var allBlobs = allBlobWrappers
		.append('path')
		.attr('class', 'blob')
		.attr('d', function (d) {
			return radarLine(d.values)
		})
		.style('fill', function (d, i) {
			return cfg.color(i)
		})
		.style('fill-opacity', 0.8)

	//Create the outlines	
	allBlobs
		.attr("class", "radarStroke")
		.attr("d", function (d, i) {
			return radarLine(d.values);
		})
		.style("stroke-width", cfg.strokeWidth + "px")
		.style("stroke", function (d, i) {
			return cfg.color(i);
		})
	
	//Add circles
	var allPoints = allBlobWrappers
		.selectAll(".radarCircle")
		.data(function (d, i) {
			return d.values;
		})
		.enter()
		.append("circle")
		.attr("r", cfg.dotRadius)
		.attr("cx", function (d, i) {
			return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
		})
		.attr("cy", function (d, i) {
			return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
		})
		.attr("class", "radarCircle")
		.style("fill", function (d, i, j) {
			return cfg.color(j);
		})
		.style("fill-opacity", 1)


	//Append invisible circles for tooltip

	// //Wrapper for the invisible circles on top
	var blobCircleWrapper = g.selectAll(".radarCircleWrapper")
		.data(getGrouped)
		.enter().append("g")
		.attr("class", "radarCircleWrapper");

	//Append a set of invisible circles on top for the mouseover pop-up
	blobCircleWrapper.selectAll(".radarInvisibleCircle")
		.data(function (d, i) {
			console.log(d.values)
			console.log(d.yearly)
			return d.values;
		})
		.enter().append("circle")
		.attr("class", "radarInvisibleCircle")
		.attr("r", cfg.dotRadius * 1.5)
		.attr("cx", function (d, i) {
			return rScale(d.value) * Math.cos(angleSlice * i - Math.PI / 2);
		})
		.attr("cy", function (d, i) {
			return rScale(d.value) * Math.sin(angleSlice * i - Math.PI / 2);
		})
		.style("fill", "none")
		.style("pointer-events", "all")
		.on("mouseover", function (d, i) {
			newX = parseFloat(d3.select(this).attr('cx')) - 10;
			newY = parseFloat(d3.select(this).attr('cy')) - 10;

			tooltip
				.attr('x', newX)
				.attr('y', newY)
				.text(Format(d.value))
				.transition().duration(200)
				.style('opacity', 1)
		})

		.on("mouseout", function () {
			tooltip.transition().duration(200)
				.style("opacity", 0);
		});

	//Set up the small tooltip for when you hover over a circle
	var tooltip = g.append("text")
		.attr("class", "tooltip")
		.style("opacity", 0)

	// //Create the mouseover event
	allBlobs
		.on('mouseover', function (selectedData) {
			allBlobs
				.transition().duration(200)
				.style("fill-opacity", function (d) {
					if (d == selectedData) {
						return 1;
					}
					return 0.1;
				})
		})
		.on('mouseout', function (d) {
			allBlobs
				.transition().duration(200)
				.style('fill-opacity', 0.8)
			console.log('out');
		});


	var legends = g.selectAll(".legend")
		.data(getGrouped)
		.enter()
		.append("text")
		.text(function (d) {
			return d.key
		})
		.attr("text-anchor", "left")
		.attr("x", "-325")
		.attr("y", "0")
		.attr("font-size", "14px")
		.attr("transform", function (d, i) {
			{
				return "translate(0," + i * 20 + ")"
			}
		})
		.style("display", "none")

	var rectangles = g.selectAll(".legend")
		.data(getGrouped)
		.enter()
		.append("rect")
		.attr("width", 10)
		.attr("height", 10)
		.attr("x", "-340")
		.attr("y", "-9")
		.attr("transform", function (d, i) {
			{
				return "translate(0," + i * 20 + ")"
			}
		})
		.style("display", "none")
		.attr("rx", 2)
		.attr("ry", 2)
		.style("fill", function (d, i, j) {
			return cfg.color(i);
		})
		.style("fill-opacity", 1);

		//Hover on legends
		legends
		.on('mouseover', function (selectedData) {
			allBlobs
				.transition().duration(200)
				.style("fill-opacity", function (d) {
					if (d == selectedData) {
						return 1;
					}
					return 0.1;
				})
		})
		.on('mouseout', function (d) {
			allBlobs
				.transition().duration(200)
				.style('fill-opacity', 0.8)
			console.log('out');
		});

		//Hover on rectangles
		rectangles
		.on('mouseover', function (selectedData) {
			allBlobs
				.transition().duration(200)
				.style("fill-opacity", function (d) {
					if (d == selectedData) {
						return 1;
					}
					return 0.1;
				})
		})
		.on('mouseout', function (d) {
			allBlobs
				.transition().duration(200)
				.style('fill-opacity', 0.8)
			console.log('out');
		});

	$(document).ready(function () {

		var selectedCountriesList, yearsList;
		$('#countryDropdown').multiselect({
			nonSelectedText: '+ add country',
			buttonWidth: '170px'

		});

		// Get every single <select> tag and bind this function to when it changes
		$('#countryDropdown').on('change', function (event) {
			selectedCountriesList = $('#countryDropdown').val();

			updateGraph(selectedCountriesList, yearsList);
		});

	});
	
	// Create dropdown
	var countryMenu = d3.selectAll("#countryDropdown")
	countryMenu
		.selectAll("option")
		.data(getGrouped)
		.enter()
		.append("option")
		.attr("value", function (d) {
			return d.key;
		})
		.text(function (d) {
			return d.key;
		})

	//Update graph
	var updateGraph = function (selectedCountriesList, yearsList) {

		if (selectedCountriesList === null && yearsList === null) {
			return;
		}

		allBlobWrappers
			.transition().duration(1000)
			.ease(d3.easeCircleInOut)
			.style('display', function (d, i) {
				if (selectedCountriesList.includes(d.key)) {
					console.log('yes')
					return 'block';
				}
				return 'none';
			})
			.style('opacity', function (d) {
				if (selectedCountriesList.includes(d.key)) {
					return '1.0';
				}
				return '0';
			});

		legends
			.transition().duration(1200)
			.ease(d3.easeCircleInOut)
			.style('display', function (d) {
				if (selectedCountriesList.includes(d.key)) {
					return 'block'
				}
				return 'none';
			})

			.attr('transform', function (d) {
				var thisIndex = selectedCountriesList.findIndex(function (el) {
					return el === d.key
				});
				return "translate(0," + thisIndex * 20 + ")";
			})

		rectangles
			.transition().duration(1200)
			.ease(d3.easeCircleInOut)
			.style('display', function (d) {
				if (selectedCountriesList.includes(d.key)) {
					return 'block'
				}
				return 'none';
			})
			.attr('transform', function (d) {
				var thisIndex = selectedCountriesList.findIndex(function (el) {
					return el === d.key
				});
				return "translate(0," + thisIndex * 20 + ")";
			})


	}

	
	//Helper Function

	//Taken from http://bl.ocks.org/mbostock/7555321
	//Wraps SVG text	
	function wrap(text, width) {
		text.each(function () {
			var text = d3.select(this),
				words = text.text().split(/\s+/).reverse(),
				word,
				line = [],
				lineNumber = 0,
				lineHeight = 1.4, 
				y = text.attr("y"),
				x = text.attr("x"),
				dy = parseFloat(text.attr("dy")),
				tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", dy + "em");

			while (word = words.pop()) {
				line.push(word);
				tspan.text(line.join(" "));
				if (tspan.node().getComputedTextLength() > width) {
					line.pop();
					tspan.text(line.join(" "));
					line = [word];
					tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
				}
			}
		});
	}	
	
}
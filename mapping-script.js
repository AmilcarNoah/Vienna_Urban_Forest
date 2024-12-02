/* VISUALIZATION SETUP */
var width = 300; 
var height = 150;  

var div = d3.select("body") // Select the body of the website
.append("div") // Add the container for the tooltip content
.attr("class", "tooltip") // Add class name to the container
.style("opacity", 0) // Set the initial transparency of tooltip to 0 – invisible

var svg = d3.select("#mapContainer")  // Select the #mapContainer element within the HTML file
  .append("svg")  // Add the <svg> element to this container
  .attr("preserveAspectRatio", "xMidYMid")  // Preserve the aspect ratio of the <svg> element
  .attr("viewBox", [0, 0, width, height])  // Set the position and dimension, in user space, of an SVG viewport - setting for the responsive design
  .attr("title", "Trees in Vienna");  // Add the title of the <svg> element

var g = svg.append("g");
var l = svg.append("g");

var projection = d3.geoAlbers()  
  .center([16.373, 48.208]); // center to Vienna

var path = d3.geoPath()
  .projection(projection);
  

////////////////Street Data//////////////////////////

d3.json("data/streets-oldtown.geojson")
  .then(function(streets) {
    // Process streets data (if needed)
  })
  .catch(function(error) {
    alert("There was an issue loading the street dataset. Please try again later.");
  });

d3.json("data/streets-oldtown.geojson")  
  .then(function(streets) {
    projection.fitSize([width, height], streets);

    l.selectAll("path")
      .data(streets.features)  
      .enter()  
      .append("path")  
      .attr("d", path)
      .attr("fill", "none")
      .attr("stroke", "rgb(112,128,144)")
      .attr("stroke-width", 0.2)  // Set stroke width
      .attr("stroke-opacity", 0.5);
  })
  .catch(function(error) {
    alert("There was an issue loading the street dataset. Please check the file path and try again.");
  });

////////////////////////Tree Data////////////////////////////////////
d3.json("data/trees-oldtown.geojson")       
  .then(function(trees) {

    // Compute the smallest and largest trunk sizes from the dataset
    var smallestTree = d3.min(trees.features, d => d.properties.TrunkSize);
    var biggestTree = d3.max(trees.features, d => d.properties.TrunkSize);

    // Define a consistent scale for trunk sizes (used for both tree circles and legend)
    var trunkSizeRadiusScale = d3.scaleSqrt()
      .domain([0,200,400,600])
      .range([1,2,4,6]);  

      
    // Add the tree circles
    g.selectAll("trees")  // Take the "tree" selector and return a selection of all such elements
      .data(trees.features) // Bind the data
      .enter()  // Bind data to the selection
      .append("circle")  // Append circle symbol for each data entry
      .attr('cx', function(d) {  // Set the x-coordinate of the circle
        return projection(d.geometry.coordinates)[0];
      })           
      .attr('cy', function(d) {  // Set the y-coordinate of the circle  
        return projection(d.geometry.coordinates)[1];
      })     
      
      .attr("stroke-width", 0.5)
      .attr("stroke-opacity", 1)
      .attr('stroke', function(d) {
        if (d.properties.PlantingYear >= 2001 && d.properties.PlantingYear <= 2021) {
          return "#984ea3"; 
        } else if (d.properties.PlantingYear >= 1981 && d.properties.PlantingYear <= 2000) {
          return "#4daf4a"; 
        } else if(d.properties.PlantingYear >= 1961 && d.properties.PlantingYear <= 1980){
          return "#377eb8";
        }
        else {
          return "#e41a1c"; 
        }
      })
   
      .attr("r", function(d) {
        return trunkSizeRadiusScale(d.properties.TrunkSize); 
        })

      .attr("fill", function(d) {     
        let treeColor = d3.scaleSqrt()
          .domain([0, 2, 4, 6, 8]) 
          .range(["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"]);
        return treeColor(d.properties.TreeHeight);
      })

      ////////////////////// Events ///////////////////////////////////
      .on("dblclick", function(event, d) {
        d3.select(this)
          .raise()
          .transition()
          .duration(400)
          .attr("stroke", "#e129b9f7")
          .attr("fill", "#e129b9f7")
          .attr("stroke-width", 1.3)
          .attr("cursor", "pointer");

        div.transition()
          .duration(500)
          .style("opacity", 2);
      })
      .on("click", function(event, d) {
        d3.select(this) // Select the single tree which is being hovered over
          .raise() // Display the selected tree on the top of other trees
          .transition() // Set the smooth transition – animation from current tree state to “hovered” state
          .duration(500) // Set the time for transition - in milliseconds
          .attr("fill", "aqua") // Change tree colour to blue
          .attr("stroke", "aqua") // Change the stroke color of the circle stroke
          .attr("cursor", "pointer"); // Change default mouse cursor to pointer with the finger
      })
      .on("mouseover", function(event, d) {
        d3.select(this) // Select the single tree which is being hovered over
          .raise() // Display the selected tree on the top of other trees
          .transition() // Set the smooth transition – animation from current tree state to “hovered” state
          .duration(500) // Set the time for transition - in milliseconds
          .attr("fill", "white") // Change tree colour to Yellow
          .attr("stroke-width", 0.2) // Change the thickness of the circle stroke
          .attr("cursor", "pointer"); // Change default mouse cursor to pointer with the finger

        div.transition()
          .duration(10) // Set time until tooltip appears on the screen
          .style("opacity", .9); // Set the transparency of the tooltip to 90%

        // Display the data-driven text in the tooltip, e.g., year of planting
        div.html(
          "<table>" +
            "<tr>" +
              "<th>Attribute:</th>" +
              "<th>Individual " + d.properties.TreeID +  "</th>" +
            "</tr>" +
            "<tr>" +
              "<td>Species: </td>" +
              "<td>" + d.properties.TreeType + "</td>" +
            "</tr>" +
            "<td>Planting Year: </td>" +
            "<td>" + d.properties.PlantingYear + "</td>" +
            "<tr>" +
            "</tr>" +
            "<td>Tree Height(in m): </td>" +
            "<td>" + d.properties.TreeHeight + "</td>" +
            "<tr>" +
            "</tr>" +
            "<td>Trunk Size(in cm): </td>" +
            "<td>" + d.properties.TrunkSize + "</td>" +
            "<tr>" +
          "</table>"
        )
        .style("position", "absolute") // set from where the positional coordinates are counted
        .style("left", (event.pageX + 10) + "px") // Set horizontal position of the tooltip
        .style("top", (event.pageY - 10) + "px"); // Set vertical position of the tooltip
      })
      .on("mouseout", function(event, d) {
        d3.select(this)
          .lower() // Display the selected tree on the bottom of other trees (move to back)
          .transition() // Set the smooth transition – animation from “hovered” to “unhovered” state
          .duration(500) // Set the time for transition - in milliseconds
          .attr("stroke-width", 0.5) // Reset the stroke thickness to initial value
          .attr('stroke', function(d) {
            if (d.properties.PlantingYear >= 2000 && d.properties.PlantingYear <= 2021) {
              return "#984ea3"; 
            } else if (d.properties.PlantingYear >= 1980 && d.properties.PlantingYear < 2000) {
              return "#4daf4a"; 
            } else if(d.properties.PlantingYear >= 1960 && d.properties.PlantingYear < 1980){
              return "#377eb8";
            }
            else {
              return "#e41a1c"; 
            }
          })
          .attr("r", function(d) {
            return trunkSizeRadiusScale(d.properties.TrunkSize); 
          })
          .attr("fill", function(d) {
            let treeColor = d3.scaleSqrt()
              .domain([0, 2, 4, 6, 8]) 
              .range(["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"]);
            return treeColor(d.properties.TreeHeight);
          });

        div.transition()
          .duration(10) // Set time until tooltip disappears
          .style("opacity", 0); // Set the transparency of the tooltip to 0%
      });

    ////////////////////// Tree Trunk Size legend////////////////////////////////
    var trunkSizeOffsetY = t_height_OffsetY + t_height_Labels.length * (t_height_CircleRadius * 2 + t_height_SymbolGap) + 40;

    //////// Rage set at an approximaion of the scale from the Map///////
    var trunkSizelegend = d3.scaleSqrt()
      .domain([0,200,400,600])
      .range([1,10,18,25]);  
    // Add the trunk size legend
    legend.selectAll(".trunk-size-legend-symbols")
      .data([smallestTree, 200, 400, biggestTree])
      .enter()
      .append("circle")
      .attr("class", "trunk-size-legend-symbols")
      .attr("cx", paddingX + 20) // Horizontal position
      .attr("cy", function(d, i) {
        return trunkSizeOffsetY + i * (15 + 30); // Vertical spacing
    })
    .attr("r", function(d) {
      return trunkSizelegend(d); // Use the scale
    })
    .style("fill", "none")
    .style("stroke", "black")
    .style("stroke-width", 1);

  // Add the labels for the trunk size 
  legend.selectAll(".trunk-size-legend-labels")
    .data(["0", "1-200","201-400","401-600"])
    .enter()
    .append("text")
    .attr("class", "trunk-size-legend-labels")
    .attr("x", paddingX + 22 + 25) // Space between circle and text
    .attr("y", function(d, i) {
      return trunkSizeOffsetY + i * (20 + 25); // Vertical position
    })
    .style("fill", "black")
    .text(function(d) { return d ; }) // Display trunk size in cm
    .attr("font-size", "14px")
    .attr("font-style", "italic")
    .style("alignment-baseline", "middle");
    // Label for Trunk size
    legend.append("text")
    .attr("x", paddingX)
    .attr("y", trunkSizeOffsetY - 10)
    .text("Trunk Size (centimeters)")
    .attr("font-size", "16px")
    .attr("font-weight", "bold")
    .style("fill", "black");

   
     
  })

  .catch(function(error) {
    alert("There are some mistakes in the code with the trees dataset");

          })
  .catch(function(error) {  // Display message if any data errors occur 
    alert("There are some mistakes in the code with the trees dataset");
  });

///////////////////////Zooming///////////////////////////////////
 
var zoom = d3.zoom() // Create zoom and pan behavior
  .scaleExtent([1, 8]) // Set how far can you zoom [out, in] your map
  .on('zoom', function(event) {
      l.attr('transform', event.transform) // Scale trees when zoomed in / out
      g.attr('transform', event.transform) // Scale streets when zoomed in / out
  })
svg.call(zoom)

function zoomIn() {
  d3.select('svg')
    .transition(1)
    .call(zoom.scaleBy, 2)
  }

function zoomOut() {
  d3.select('svg')
    .transition(1)
    .call(zoom.scaleBy, 0.5);  // Zoom out by a factor of 0.5
}

function resetZoom() {
  // Reset the zoom scale and translation to the default values
  d3.select('svg')
    .transition().duration(200) // Optional transition for smooth reset
    .call(zoom.transform, d3.zoomIdentity); // Reset to no zoom or pan
}

var t = textures.circles()
.lighter();
svg.call(t);


/////////////////////////////////////////////////////////////

// Create Legend to symbolize elements

var totalLegendWidth = 300;
var totalLegendHeight = 540; // Adjusted height to fit both legends

// Create the SVG container for the legend
var legend = d3.select("#legend")
  .append("svg")
  .attr("width", totalLegendWidth)
  .attr("height", totalLegendHeight)
  .style("background-color", "lightgray"); 

// Padding for the layout
var paddingX = 20;
var paddingY = 40;

// Labels for the Planting Years legend (Symbolizing planting years using Stroke color)
var circleLabels = ["Other (pre-1961)", "1961-1980", "1981-2000", "2001-2021"];
let circleColorScale = d3.scaleOrdinal()
  .domain(circleLabels)
  .range(["#e41a1c", "#377eb8", "#4daf4a", "#984ea3"]);

// Circle layout parameters
var circleRadius = 6;
var circleSymbolGap = 15;
var circleLabelGap = 30;

// Planting Year label 
legend.append("text")
  .attr("x", paddingX)
  .attr("y", paddingY - 7)
  .text("Planting Year")
  .attr("font-size", "16px")
  .attr("font-weight", "bold")
  .style("fill", "black");

// Planting Year legend symbols
legend.selectAll(".circle-legend-symbols")
  .data(circleLabels)
  .enter()
  .append("circle")
  .attr("cx", paddingX + circleRadius)
  .attr("cy", function(d, i) {
    return paddingY + i * (circleRadius * 2 + circleSymbolGap) + circleRadius;
  })
  .attr("r", circleRadius)
  .style("fill", "none")
  .style("stroke", function(d) { return circleColorScale(d); })
  .style("stroke-width", 3);

// Planting Year legend labels
legend.selectAll(".circle-legend-labels")
  .data(circleLabels)
  .enter()
  .append("text")
  .attr("x", paddingX + circleLabelGap + circleRadius * 2)
  .attr("y", function(d, i) {
    return paddingY + i * (circleRadius * 2 + circleSymbolGap) + circleRadius;
  })
  .style("fill", "black")
  .text(function(d) { return d; })
  .attr("font-size", "14px")
  .attr("font-style", "italic")
  .style("alignment-baseline", "middle");

// Legend for Tree Height (Using Colored Fill)
var t_height_OffsetY = paddingY + circleLabels.length * (circleRadius * 2 + circleSymbolGap) + 40;

// Label for Tree Height
legend.append("text")
  .attr("x", paddingX)
  .attr("y", t_height_OffsetY - 10)
  .text("Tree Height(meters)")
  .attr("font-size", "16px")
  .attr("font-weight", "bold")
  .style("fill", "black");

// Labels for Tree Height
var t_height_Labels = ["0", "1-2 ", "3-4", "5-6", "7-8"];
let t_height_ColorScale = d3.scaleOrdinal()
  .domain(t_height_Labels)
  .range(["#edf8fb", "#b2e2e2", "#66c2a4", "#2ca25f", "#006d2c"]);

// Add the tree height legend symbols as circles
var t_height_CircleRadius = 6;
var t_height_SymbolGap = 15;
var t_height_LabelGap = 30;

legend.selectAll(".t_height-circle-legend-symbols")
  .data(t_height_Labels)
  .enter()
  .append("circle")
  .attr("cx", paddingX + t_height_CircleRadius)
  .attr("cy", function(d, i) {
    return t_height_OffsetY + i * (t_height_CircleRadius * 2 + t_height_SymbolGap) + t_height_CircleRadius;
  })
  .attr("r", t_height_CircleRadius)
  .style("fill", function(d) { return t_height_ColorScale(d); })
  .style("stroke", "none");

// Add the tree height legend labels
legend.selectAll(".t_height-circle-legend-labels")
  .data(t_height_Labels)
  .enter()
  .append("text")
  .attr("x", paddingX + t_height_LabelGap + t_height_CircleRadius * 2)
  .attr("y", function(d, i) {
    return t_height_OffsetY + i * (t_height_CircleRadius * 2 + t_height_SymbolGap) + t_height_CircleRadius;
  })
  .style("fill", "black")
  .text(function(d) { return d; })
  .attr("font-size", "14px")
  .attr("font-style", "italic")
  .style("alignment-baseline", "middle");







//////////////////References Used ////////////////////////////
//D3 Documentation @ https://d3-graph-gallery.com/graph/custom_legend.html
// Color Legend by Mike Bostock @ https://observablehq.com/@d3/color-legend



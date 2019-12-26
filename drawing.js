function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function nextPoint(posX,posY,prevDirectionX,prevDirectionY,xMax,yMax){
  // if currentDirection is fine then move along
  if (posX + prevDirectionX < xMax & posX + prevDirectionX >= 0 & posY + prevDirectionY < yMax & posY + prevDirectionY >= 0){
    return [posX + prevDirectionX,posY + prevDirectionY,prevDirectionX,prevDirectionY]
  }
  if (posX + prevDirectionX >= xMax | posX + prevDirectionX < 0){
    return [posX - prevDirectionX,posY + prevDirectionY,-prevDirectionX,prevDirectionY]
  }
  if (posY + prevDirectionY >= yMax | posY + prevDirectionY < 0){
    return [posX + prevDirectionX,posY - prevDirectionY,prevDirectionX,-prevDirectionY]
  }
  return null
}

function makePathFrom(initialPointX,initialPointY,xMax,yMax,startFlip){
  // if we are back where we started then we have finished, we have to come back twice
  // to be complete
  var maxVisits = 2;
  var prevDirectionX = 1;
  var prevDirectionY = -1;

  // to get the right curve from first point starts in a different orientation
  if (initialPointX == 1){
    initialPointY = 2;
    prevDirectionX = -1;
    prevDirectionY = -1;
  }
  else if (initialPointX == xMax){
    initialPointX = initialPointX - 2;
  }
  else{
    initialPointX = initialPointX - 1;
  }

  var posX = initialPointX;
  var posY = initialPointY;

  var lineData = [{"x":posX,"y":posY}];

  // decided to pass startFlip in case don't want to start with an over weave
  // but with the current approach of going along top line not sure it is necessary
  // as all top lines go over?
  var flip = startFlip;

  var repeatedVisits = 0
  while (repeatedVisits < maxVisits){
    var next = nextPoint(posX,posY,prevDirectionX,prevDirectionY,xMax,yMax);

    posX = next[0],posY = next[1], prevDirectionX = next[2], prevDirectionY = next[3];

    if (posX > 0 & posX < xMax-1 & posY > 0 & posY < yMax-1){
      if (flip == 1){
        lineData.push({"x":posX-0.2*prevDirectionX,"y":posY-0.2*prevDirectionY});
        lineData.push({"x":null,"y":null});
        lineData.push({"x":posX+0.2*prevDirectionX,"y":posY+0.2*prevDirectionY});
      }
      else{
        lineData.push({"x":posX,"y":posY});
      }
      flip = -flip;
    }
    else{
      lineData.push({"x":posX,"y":posY});
    }

    if (posX == initialPointX & posY == initialPointY){
      repeatedVisits = repeatedVisits + 1;
    }
  }

  return lineData
}

function findNextEdgePoint(lines,xMax){
  // investigate the top line, if all points have been visited (if region has no holes) then we are done
  for (var x=1;x<2*xMax-1;x=x+2){
    var found = false;
    for (var i=0;i<lines.length;i++){
      // check each line
      for (var j=0;j<lines[i].length;j++){
        // check each point
        if (lines[i][j].y == 0 & lines[i][j].x == x){
          found = true;
          break
        }
      }
    }
    if (found == false){
      return x
    }
  }
  return null
}

function makePath(xMax,yMax){
  var lines = [];

  var initialPointY = 1;

  initialPointX = findNextEdgePoint(lines,xMax);

  while (initialPointX !== null){
    lines.push(makePathFrom(initialPointX,initialPointY,2*xMax-1,2*yMax-1,1));
    initialPointX = findNextEdgePoint(lines,xMax);
  }

  return lines
}

function drawPath(lineData,gapX,gapY,colour){
  // convert to drawn co-ordinates
  lineDataCopy = []
  for (var i=0;i<lineData.length;i++){
    if (lineData[i].x !== null){
      lineDataCopy.push({'x':lineData[i].x*gapX,'y':lineData[i].y*gapY});
    }
    else{
      lineDataCopy.push({'x':null,'y':null});
    }
  }

  // draw it
  var lineFunction = d3.line()
                       .x(function(d) { return d.x; })
                       .y(function(d) { return d.y; })
                       .defined(function (d) { return !(d.x == null); })
                       .curve(d3.curveBasis)

  var lineGraph = svgContainer.append("path")
                              .attr("d", lineFunction(lineDataCopy))
                              .attr("stroke", colour)
                              .attr("stroke-width", 5)
                              .attr("fill", "none");
}

function drawAllPaths(lines,gapX,gapY){
  colourCycle = ["blue","red","black"]
  for (var i=0;i<lines.length;i++){
    drawPath(lines[i],gapX,gapY,colourCycle[i%3]);
  }
}

function drawCircles(sizeX,sizeY,gapX,gapY){
  var circleRadii = []
  for (var i=0;i<sizeX*sizeY;i++){
    circleRadii.push(5);
  }

  circles = svgContainer.selectAll("circle")
                        .data(circleRadii)

  circles.enter()
         .append("circle")
         .attr("cx",function(d,i){
           return gapX*(i%sizeX);
         })
         .attr("cy",function(d,i){
           return gapY*(Math.floor(i/sizeX)%sizeY);
         })
         .attr("r",function(d){
           return d;
         })
}

function getValues(){
  // note have to add 1 to the x and y size as user specifies num boxes whereas
  // code works off num fenceposts
  var sizeX = parseInt(document.getElementById("sizeX").value) + 1;
  var sizeY = parseInt(document.getElementById("sizeY").value) + 1;

  var gapX = parseInt(document.getElementById("gapX").value);
  var gapY = parseInt(document.getElementById("gapY").value);

  // remove previous svg
  d3.select("svg").remove()

  // make new
  svgContainer = d3.select("body")
                   .append("svg")
                   .attr("width",(sizeX-1)*gapX)
                   .attr("height",(sizeY-1)*gapY)

  // make the line path
  var linePaths = makePath(sizeX,sizeY)

  drawAllPaths(linePaths,gapX/2,gapY/2)
}

function showGrid(){
  var sizeX = parseInt(document.getElementById("sizeX").value) + 1;
  var sizeY = parseInt(document.getElementById("sizeY").value) + 1;

  var gapX = parseInt(document.getElementById("gapX").value);
  var gapY = parseInt(document.getElementById("gapY").value);


  var lines = [];

  // if no lines are being shown, add the lines
  var numLines = d3.select("svg").selectAll(".grid").size();

  if (numLines == 0){
    for (var i=0;i<=sizeX;i++){
      lines.push([{'x':gapX*i,'y':0},{'x':gapX*i,'y':gapY*sizeY}]);
    }
    for (var i=0;i<=sizeY;i++){
      lines.push([{'x':0,'y':gapY*i},{'x':gapX*sizeX,'y':gapY*i}]);
    }
  }

  // draw the lines
  var lineFunction = d3.line()
                       .x(function(d) { return d.x; })
                       .y(function(d) { return d.y; })

  gridLines = d3.select("svg").selectAll(".grid")
                .data(lines)

  gridLines.exit().remove()

  gridLines.enter().append("path")
            .attr("d", function(d){
              return lineFunction(d);
            })
            .attr("stroke", "black")
            .attr("stroke-width", 1)
            .attr("fill", "none")
            .attr("class","grid")
}

var sizeX = 7
var sizeY = 6
var gapX = 50
var gapY = 50

svgContainer = d3.select("body")
                 .append("svg")
                 .attr("width",(sizeX-1)*gapX)
                 .attr("height",(sizeY-1)*gapY)

                 // make the line path
                 var linePaths = makePath(sizeX,sizeY)

                 drawAllPaths(linePaths,gapX/2,gapY/2)

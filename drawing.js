// consider moving from where the values are got only into the drawing function

function getRndInteger(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

function pointsAreEqual(point1,point2){
  if (point1[0] == point2[0] & point1[1] == point2[1]){
    return true
  }
  return false
}

function convertGridPointsToKnotPoints(list){
  var pointsReflectX = [];
  var pointsReflectY = [];
  for (var i=0;i < list.length; i ++){
    var x = list[i][0];
    var y = list[i][1];

    pointsReflectY.push([2*x,2*y+1])
    pointsReflectY.push([2*(x+1),2*y+1])

    pointsReflectX.push([2*x+1,2*y])
    pointsReflectX.push([2*x+1,2*(y+1)])
  }

  return [pointsReflectX,pointsReflectY]
}

function getBottomKnotPoints(list){
  // only open ones!
  var bottomKnotPoints = [];
  for (var i=0;i < list.length; i ++){
    var x = list[i][0];
    var y = list[i][1];

    var bottomX = 2*x + 1;
    var bottomY = 2*(y+1);

    // ensure the bottom point is not also a top point (cannot be reached in that case)
    var allowed = true;
    for (var j=0;j<list.length;j++){
      var testX = list[j][0];
      var testY = list[j][1];

      var topX = 2*testX + 1;
      var topY = 2*testY;

      if (pointsAreEqual([bottomX,bottomY],[topX,topY])){
        allowed = false;
        break
      }
    }

    if (allowed == true){
      bottomKnotPoints.push([2*x+1,2*(y+1)])
    }
  }

  return bottomKnotPoints
}

function nextPoint(posX,posY,prevDirectionX,prevDirectionY,xMax,yMax){
  var convertedGridPoints = convertGridPointsToKnotPoints(removedPoints);
  var pointsReflectX = convertedGridPoints[0];
  var pointsReflectY = convertedGridPoints[1];

  // deal with reflecting in x
  if (posX + prevDirectionX >= xMax - 1 | posX + prevDirectionX <= 0){
    return [posX + prevDirectionX,posY + prevDirectionY,-prevDirectionX,prevDirectionY,false]
  }
  for (var i=0;i<pointsReflectX.length;i++){
    if (pointsAreEqual([posX + prevDirectionX, posY + prevDirectionY],pointsReflectX[i])){
      return [posX + prevDirectionX,posY + prevDirectionY,prevDirectionX,-prevDirectionY,false]
    }
  }

  // deal with reflecting in y
  if (posY + prevDirectionY >= yMax - 1 | posY + prevDirectionY <= 0){
    return [posX + prevDirectionX,posY + prevDirectionY,prevDirectionX,-prevDirectionY,false]
  }
  for (var i=0;i<pointsReflectY.length;i++){
    if (pointsAreEqual([posX + prevDirectionX, posY + prevDirectionY],pointsReflectY[i])){
      return [posX + prevDirectionX,posY + prevDirectionY,-prevDirectionX,prevDirectionY,false]
    }
  }

  // if currentDirection is fine then move along
  if (posX + prevDirectionX < xMax  - 1 & posX + prevDirectionX > 0 & posY + prevDirectionY < yMax  - 1 & posY + prevDirectionY > 0){
    return [posX + prevDirectionX,posY + prevDirectionY,prevDirectionX,prevDirectionY,true]
  }

  // something has gone wrong
  return null
}

function makePathFrom(initialPointX,initialPointY,xMax,yMax,startFlip){
  // if we are back where we started then we have finished, we have to come back twice
  // to be complete
  var maxVisits = 2;
  var prevDirectionX = 1;
  var prevDirectionY = -1;

  // TO FIND A VALID START POSITION ATTEMPT THE LEFT SIDE, IF NOT POSSIBLE MOVE TO BOTTOM
  // IF NOT POSSIBLE, MOVE TO RIGHT, SHOULD COVER ALL CASES

  // find invalid start locations (aka reflecting boundaries)
  var convertedGridPoints = convertGridPointsToKnotPoints(removedPoints);
  var pointsReflectX = convertedGridPoints[0];
  var pointsReflectY = convertedGridPoints[1];

  // if the start location is invalid, we have to process around
  var attempts = 0;
  while (attempts < 2){
    var valid = true;
    if (initialPointX == 0){
      valid = false;
    }
    else{
      for (var i=0;i<pointsReflectX.length;i++){
        if ((pointsAreEqual([initialPointX,initialPointY],pointsReflectX[i])) | pointsAreEqual([initialPointX,initialPointY],pointsReflectY[i])){
          valid = false;
          break
        }
      }
    }
    if (valid == true){
      break
    }
    else{
      if (attempts == 0){
        initialPointX = initialPointX + 1;
        initialPointY = initialPointY + 1;
        prevDirectionX = -1;
        prevDirectionY = -1;
      }
      else if (attempts == 1) {
        initialPointX = initialPointX + 1;
        initialPointY = initialPointY - 1;
        prevDirectionX = -1;
        prevDirectionY = 1;
      }
      attempts = attempts + 1;
    }
  }

  if (attempts == 2){
    // this is a circle, need to return something
    // return a diamond
    initialPointX = initialPointX - 1;
    initialPointY = initialPointY - 1;
    var lineData = [{"x":initialPointX-0.7,"y":initialPointY+1.6},{"x":initialPointX-0.5,"y":initialPointY+1.8},{"x":initialPointX-0.1,"y":initialPointY+1.9},{"x":initialPointX+0.2,"y":initialPointY+1.9},{"x":initialPointX+0.8,"y":initialPointY+1.5},{"x":initialPointX+0.8,"y":initialPointY+0.8},{"x":initialPointX,"y":initialPointY},{"x":initialPointX-0.8,"y":initialPointY+1},{"x":initialPointX,"y":initialPointY+1.6},{"x":initialPointX+0.4,"y":initialPointY+1},{"x":initialPointX,"y":initialPointY + 0.8}]
    return lineData
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
    var next = nextPoint(posX,posY,prevDirectionX,prevDirectionY,xMax,yMax,removedPoints);
    // console.log(next)

    posX = next[0],posY = next[1], prevDirectionX = next[2], prevDirectionY = next[3],toFlip = next[4];

    if (toFlip == true){
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
  console.log(lines)
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
      // check the top edge point is allowed!
      var allowed = true;
      for (var i=0;i<removedPoints.length;i++){
        if (removedPoints[i][1] == 0 & 2*removedPoints[i][0] + 1 == x){
          allowed = false;
          break
        }
      }
      if (allowed == true){
        return [x-1,1]
      }

    }
  }

  // now check any missing bottom grid points
  var bottomKnotPoints = getBottomKnotPoints(removedPoints)

  for (var x=0;x<bottomKnotPoints.length;x++){
    // only check not top line ones as these have been done already
    var found = false;
    for (var i=0;i<lines.length;i++){
      // check each line
      for (var j=0;j<lines[i].length;j++){
        // check each point
        if (lines[i][j].y == bottomKnotPoints[x][1] & lines[i][j].x == bottomKnotPoints[x][0]){
          found = true;
          break
        }
      }
    }
    if (found == false){
      // note we return the y co-ordinate plus 1 so that it is already in the right y level
      return [bottomKnotPoints[x][0]-1,bottomKnotPoints[x][1] + 1]
    }
  }

  return null
}

function makePath(xMax,yMax){
  var lines = [];

  var initialPoints = findNextEdgePoint(lines,xMax);

  while (initialPoints !== null){

    var initialPointX = initialPoints[0];
    var initialPointY = initialPoints[1];

    lines.push(makePathFrom(initialPointX,initialPointY,2*xMax-1,2*yMax-1,1));

    var initialPoints = findNextEdgePoint(lines,xMax);
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
                              .attr("fill", "none")
                              .attr("class","knot")
}

function drawAllPaths(lines,gapX,gapY){
  colourCycle = ["blue","red","black"]
  for (var i=0;i<lines.length;i++){
    drawPath(lines[i],gapX,gapY,colourCycle[i%3]);
  }
}

function deleteGridSquare(point){
  // check if the point has already been removed, as then add back
  var found = false;
  var index = -1;
  for (var i=0; i < removedPoints.length; i ++){
    if (pointsAreEqual(point,removedPoints[i])){
      found = true;
      index = i;
      break
    }
  }
  if (found == false){
    removedPoints.push(point);
  }
  else{
    removedPoints.splice(index,1);
  }

  removeKnots()
}

function removeKnots(){
  d3.select("svg").selectAll("path").filter(".knot").remove()
}

function drawKnots(){
  var values = getValues()
  var sizeX = values[0]
  var sizeY = values[1]
  var gapX = values[2]
  var gapY = values[3]

  // make the line path
  var linePaths = makePath(sizeX,sizeY)

  drawAllPaths(linePaths,gapX/2,gapY/2)
}

function makeSVG(){
  // reset the removed points
  removedPoints = [];

  var values = getValues()
  var sizeX = values[0]
  var sizeY = values[1]
  var gapX = values[2]
  var gapY = values[3]

  // get out of edit mode and remove the edit button if present so it doesn't screw stuff up
  d3.select(".controls").classed("edit-mode",false)
  d3.select(".edit-button").remove()

  // remove previous svg
  d3.select("svg").remove()

  // make new
  svgContainer = d3.select("body")
                   .append("svg")
                   .attr("width",(sizeX-1)*gapX)
                   .attr("height",(sizeY-1)*gapY)

                   .on("click", function() {
                     var clickedPoint = d3.mouse(this);
                     // only remove if in editing mode
                     if (d3.select(".controls").classed("edit-mode") == true){
                       console.log(Math.floor(clickedPoint[0]/gapX) + ' ' + Math.floor(clickedPoint[1]/gapY))
                       deleteGridSquare([Math.floor(clickedPoint[0]/gapX),Math.floor(clickedPoint[1]/gapY)])

                       // remove existing knot and draw again
                       removeKnots()
                       drawKnots()
                     }
                    })

  drawKnots()

}

function showGrid(){
  var values = getValues()
  var sizeX = values[0]
  var sizeY = values[1]
  var gapX = values[2]
  var gapY = values[3]

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

    // add a button for removing rectangles
    d3.select(".controls")
      .append("button")
      .text("Edit grid")
      .attr("class","edit-button")
      .on("click",function(){
        if (d3.select(".controls").classed("edit-mode")){
          d3.select(".controls").classed("edit-mode",false);
          d3.select(this).text("Edit grid");
        }
        else{
          d3.select(".controls").classed("edit-mode",true);
          d3.select(this).text("Stop editing");
        }
      })
  }
  else{
    d3.select(".controls").classed("edit-mode",false);
    d3.select(".edit-button").remove()
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

function getValues(){
  // note have to add 1 to the x and y size as user specifies num boxes whereas
  // code works off num fenceposts
  var sizeX = parseInt(document.getElementById("sizeX").value) + 1;
  var sizeY = parseInt(document.getElementById("sizeY").value) + 1;

  var gapX = parseInt(document.getElementById("gapX").value);
  var gapY = parseInt(document.getElementById("gapY").value);

  return [sizeX,sizeY,gapX,gapY]
}

// maintain a list of grid squares which have been deleted and reflect the knot
removedPoints = [];

// start the page with an existing drawing
makeSVG()

//------------------------------------GLOBAL VARIABLES------------------------------------------------------------------
var viewport = {x1: 0, y1: 0, x2: 100, y2: 100};
var worldWindow = {x1: 0, y1: 0, x2: 1000, y2: 1000};
var clippingViewport
var clipping = false
var graphicCanvas, graphics;

graphicCanvas = document.getElementById('viewport');
graphics = graphicCanvas.getContext('2d');

var viewportMouse = { //make a globally available object with x,y attributes
  x: 0,
  y: 0
}
var windowMouse = { //make a globally available mouse coordinate point object with x,y in world coordinate
  x: 0,
  y: 0
}

graphicCanvas.onmousemove = function (event) { // this  object refers to canvas object
  viewportMouse = {
    x: event.pageX - this.offsetLeft,
    y: event.pageY - this.offsetTop
  }
}

//------------------------------------UTILITY FUNCTIONS-----------------------------------------------------------------
function lerp(a, b, t) {
// var A = [1,2,3]
// var B = [2,5,6]
//
// var X = lerp(A, B, 0.01)

  var len = a.length
  if(b.length != len) return

  var x = []
  for(var i = 0; i < len; i++)
    x.push(a[i] + t * (b[i] - a[i]))
  return x
}

//------------------------------------GRAPHICS OBJECTS DEFINITION-------------------------------------------------------
function Point(x, y) {
  this.x = parseFloat(x)
  this.y = parseFloat(y)
}

function Triangle(p1, p2, p3) {
  this.p1 = p1
  this.p2 = p2
  this.p3 = p3
}

function Square(center, side) {
  // Generate the vertices
  var d = side / 2
  this.vertices = [
    new Point(center.x - d, center.y - d),
    new Point(center.x + d, center.y - d),
    new Point(center.x + d, center.y + d),
    new Point(center.x - d, center.y + d)]
}

function Triangle(p1, p2, p3) {
  // Generate the vertices
  this.vertices = [
    new Point(p1.x, p1.y),
    new Point(p2.x, p2.y),
    new Point(p3.x, p3.y)]
}

function Rectangle(p1, p2, p3, p4) {
  // Generate the vertices
  this.vertices = [
    new Point(p1.x, p1.y),
    new Point(p2.x, p2.y),
    new Point(p3.x, p3.y),
    new Point(p4.x, p4.y)]
}

//https://en.wikipedia.org/wiki/Regular_polygon
function RegularPolygon(center, radius, nSides){
  // Generate the vertices
  var i = 0;
  this.vertices = []
  for (i=0;1<nSides;i++){
    this.vertices.push({x:center.x + radius*Math.cos(2*Math.PI/nSides*i),
                        y:center.y + radius*Math.sin(2*Math.PI/nSides*i)})
  }
}

//------------------------------------DRIVER START----------------------------------------------------------------------
/**
 * vSetLineWidth set the line width
 * * @param {number} vlw - the line width in viewport coordinates
 * Also, check out {@link https://www.w3schools.com/tags/canvas_linewidth.asp|W3School} and
 *{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineWidth|Mozilla}
 */
function vSetLineWidth (vlw) {
  graphics.lineWidth = vlw
}



/**
 * vGetMousePosition is a viewport function that returns a point object containing the mouse position in viewport
 * coordinates
 * @private
 */
function vGetMousePosition (){
  return viewportMouse
}
/**
 * setOnMouseDown sets the event handler function for the canvas onmousedown event to f. In practice, sets the function that will
 * be called when someone press the mouse button
 * @param {object} f - the event handler function for the canvas onmousedown event
 */
function setOnMouseDown(f){
  graphicCanvas.onmousedown = f
}

/**
 * vDrawPoint is a viewport function used to draw a point in vP in viewport coordinates
 * @private
 * @param {object} vP - point in viewport coordinates.
 */
function vDrawPoint (vP) {
  graphics.beginPath();
  graphics.moveTo(vP.x-1, vP.y-1);
  graphics.lineTo(vP.x, vP.y);
  graphics.stroke()
}


/**
 * vDrawLine is a viewport function used to draw a line from point vP1 to point vP2 in viewport coordinates
 * @private
 * @param {object} vP1 - starting point in viewport coordinates.
 * @param {object} vP2 - ending point in viewport coordinates.
 */
function vDrawLine (vP1, vP2) {
  graphics.beginPath();
  graphics.moveTo(vP1.x, vP1.y);
  graphics.lineTo(vP2.x, vP2.y);
  graphics.stroke()
}

/**
 * vDrawRect is a viewport function used to draw a rectangle whose lower left corner is in vP1 and upper right corner is in vP2
 * @private
 * @param {object} vP1 - lower left corner point in viewport coordinates.
 * @param {object} vP2 - upper right corner point in viewport coordinates.
 */
function vDrawRect (vP1, vP2) {
  var xV, yV, wV, hV;
  xV = vP1.x;
  yV = vP1.y;
  wV = vP2.x - vP1.x;
  hV = vP2.y - vP1.y;
  graphics.strokeRect(xV, yV, wV, hV)
}
/**
 * vDrawFillRect is a viewport function used to draw a filled rectangle whose lower left corner is in vP1
 * and upper right corner is in vP2
 * @private
 * @param {object} vP1 - lower left corner point in viewport coordinates.
 * @param {object} vP2 - upper right corner point in viewport coordinates.
 */
function vDrawFillRect (vP1, vP2) {
    var xV, yV, wV, hV;
    xV = vP1.x;
    yV = vP1.y;
    wV = vP2.x - vP1.x;
    hV = vP2.y - vP1.y;
    graphics.fillRect(xV, yV, wV, hV)
}
/**
 * vDrawPolyline is a viewport function used to draw a polyline passing truogh the points
 * vPoints[0], vPoints[1], vPoints[vPoints.length-1]. Note that:
 * 1) the polyline is automatically closed, this means that
 * if  vPoints[vPoints.length-1] <> vPoints[0] a line bteween these points is drawn to
 * close the polyline;
 * 2) the polylin is drawn only if there are more than two point in the vPoints array.
 * @private
 * @param {Object[]} vPoints - array of points in viewport coordinates.
 */
function vDrawPolyline (vPoints) {
  if (vPoints.length > 2) {
    graphics.beginPath();
    graphics.moveTo(vPoints[0].x, vPoints[0].y);
    for (var i = 1; i < vPoints.length; i++) {
      graphics.lineTo(vPoints[i].x, vPoints[i].y)
    }
    graphics.closePath();
    graphics.stroke();
    graphics.fill()
  }
}

/**
 * vDrawBezier is a viewport function used to draw a bezier curve with starting point sp, first control point cp1
 * second control point cp2 and ending point ep
 * @private
 * @param {Object[]} sp - starting point  in viewport coordinates.
 * @param {Object[]} cp1 - first control point  in viewport coordinates.
 * @param {Object[]} cp2 - second control point  in viewport coordinates.
 * @param {Object[]} ep - ending  point  in viewport coordinates.
 */
function vDrawBezier (sp,cp1,cp2,ep) {
    graphics.beginPath()
    graphics.moveTo(sp.x, sp.y)
    graphics.bezierCurveTo(cp1.x, cp1.y, cp2.x, cp2.y, ep.x, ep.y);
    graphics.closePath()
    graphics.stroke()
}

/**
  * vDrawCircle is a viewport function used to draw a circle whose center is in vP1 and radius is r
  * @private
  * @param {object} vP - center point in viewport coordinates.
  * @param {float} r - radius of the circle in viewport coordinates (pixels).
  */
function vDrawCircle (vP, r) {
  graphics.beginPath();
  graphics.arc(vP.x, vP.y, r, 0, Math.PI * 2, true);
  graphics.fill()
  graphics.stroke()
}

/**
 * vDrawText is a viewport function used to draw a circle whose center is in vP1 and radius is r
 * @private
 * @param {object} vP - point representing the position of the text to be drawn in viewport coordinates.
 * @param {string} s - string containing the text to be drawn.
 */
function vDrawText (vP, s) {
  graphics.fillText(s, vP.x, vP.y);
}

/**
 * vDrawOutlinedText is a viewport function used to draw a circle whose center is in vP1 and radius is r
 * @private
 * @param {object} vP - point representing the position of the text to be drawn in viewport coordinates.
 * @param {string} s - string containing the text to be drawn.
 */
function vDrawOutlinedText (vP, s) {
  graphics.strokeText(s, vP.x, vP.y);
}

function vDrawStar(vP,r) {
  var ps =[]
  var r1

  for (var i = 0; i <= 9; i++) {
    r1=r
    if (i%2 ===1) r1 = (r / 0.525731)* 0.200811
    ps.push(
      {x:vP.x+r1*Math.cos(2*Math.PI/10*i),
       y:vP.y+r1*Math.sin(2*Math.PI/10*i)}
    )
  }
  vDrawPolyline(ps)
}

/**
  * vDrawArrow is a viewport function used to draw an arrow from point vP1 to point vP2
  * in viewport coordinates
  * @private
  * @param {object} vP1 - starting point in viewport coordinates.
  * @param {object} vP2 - ending point in viewport coordinates.
  */
function vDrawArrow(vP1, vP2) {
  var fromx = vP1.x, fromy =vP1.y, tox = vP2.x, toy = vP2.y
  var headlen = 10.0;
  var back = 4.0;
  var angle1 = Math.PI / 13.0;
  var angle2 = Math.atan2(toy - fromy, tox - fromx);
  var diff1 = angle2 - angle1;
  var diff2 = angle2 + angle1;
  var xx = getBack(back, fromx, fromy, tox, toy);
  var yy = getBack(back, fromy, fromx, toy, tox);
  graphics.beginPath();
  graphics.moveTo(fromx, fromy);
  graphics.lineTo(tox, toy);
  graphics.moveTo(xx, yy);
  graphics.lineTo(xx - headlen * Math.cos(diff1), yy - headlen * Math.sin(diff1));
  graphics.moveTo(xx, yy);
  graphics.lineTo(xx - headlen * Math.cos(diff2), yy - headlen * Math.sin(diff2));
  graphics.stroke()
}

function getBack(len, x1, y1, x2, y2) {
  return x2 - (len * (x2 - x1) / (Math.sqrt(Math.pow(y2 - y1, 2) + Math.pow(x2 - x1, 2))))
}

/**
 * vCreateLinearGradientColor sets the style used when filling shapes with a gradient color (viewport coordinates)
 * Also, check out {@link https://www.w3schools.com/tags/canvas_createlineargradient.asp|W3School} and
 *{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient|Mozilla}
 * @private
 * @param {object} sP - starting point of the gradient in viewport coordinates .
 * @param {object} eP - ending point of the gradient in viewport coordinates .
 * @param {array} colorStops -	an array of objects {stop:stop, color:color} containing the color stops of the gradient.
 */
function vCreateLinearGradientColor (sP,eP,colorStops) {
  var g=graphics.createLinearGradient(sP.x,sP.y,eP.x,eP.y)
  for (var i = 0;i<colorStops.length;i++){
    g.addColorStop(colorStops[i]["stop"],colorStops[i]["color"])
  }
  return g
}

/**
 * vCreateRadialGradientColor sets the style used when filling shapes with a radial gradient color (viewport coordinates)
 * Also, check out {@link https://www.w3schools.com/tags/canvas_createlineargradient.asp|W3School} and
 *{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient|Mozilla}
 * @private
 * @param {object} sP - center of the starting circle of the gradient in viewport coordinates .
 * @param {number} r1 - radius of the starting circle of the gradient in viewport coordinates .
 * @param {object} eP - center of the ending circle of the gradient in viewport coordinates .
 * @param {number} r2 - radius of the ending circle of the gradient in viewport coordinates .
 * @param {array} colorStops -	an array of objects {stop:stop, color:color} containing the color stops of the gradient.
 */
function vCreateRadialGradientColor (sP,r1,eP,r2,colorStops) {
  var g=graphics.createRadialGradient(sP.x,sP.y,r1,eP.x,eP.y,r2)
  for (var i = 0;i<colorStops.length;i++){
    g.addColorStop(colorStops[i]["stop"],colorStops[i]["color"])
  }
  return g
}


/**
 * vDrawImage draws the imag image with its left-top corner in vdp (viewport coordinates)
 * Also, check out {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage|Mozilla}
 * @private
 * @param {object} vdp - the image's left-top corner in  viewport coordinates .
 * @param {object} image - the image to be drawn .
 */
function vDrawImage(vdp,image) {
  graphics.drawImage(image,vdp.x,vdp.y)
}
//------------------------------------DRIVER END-----------------------------------------------------------------------

/**
 * getMousePosition  returns a point object containing the mouse position in world coordinates
 */
function getMousePosition (){
  windowMouse = viewportToWindowTransformation(viewportMouse)
  return windowMouse
}


/**
 * windowToViewportTransformation transforms a point in world coordinate in a point in viewport coordinate
 * @param {object} wP - a point in world coordinate.
 */
function windowToViewportTransformation (wP) {
  var xv, yv, xw, yw, vP;
  xw = wP.x
  yw = wP.y
  xv = (xw-worldWindow.x1)/(worldWindow.x2-worldWindow.x1)*(viewport.x2-viewport.x1)+viewport.x1
  yv = graphicCanvas.height - ((yw-worldWindow.y1)/(worldWindow.y2-worldWindow.y1)*(viewport.y2-viewport.y1)+viewport.y1)
  vP = {x: xv, y: yv}
  return vP
}

/**
 * viewportToWindowTransformation transforms a point in viewport  coordinate in a point in world coordinate
 * @param {object} vP - a point in viewport coordinate.
 */
function viewportToWindowTransformation (vP) {
  var xv, yv, xw, yw, wP;
  xv = vP.x
  yv = vP.y
  xw = (xv-viewport.x1)/(viewport.x2-viewport.x1)*(worldWindow.x2-worldWindow.x1)+worldWindow.x1
  yw = worldWindow.y2-((yv-viewport.y1)/(viewport.y2-viewport.y1)*(worldWindow.y2-worldWindow.y1)+worldWindow.y1)
  wP = {x: xw, y: yw}
  return wP
}

/**
 * windowToViewportScale transforms a real value in world coordinates in a real value in viewport coordinates
 * @param {float} w - a real value in world coordinates.
 * @see {@link windowToViewportTransformation}
 */
function windowToViewportScale (w) {
  var v;
  v = (viewport.x2 - viewport.x1) / (worldWindow.x2 - worldWindow.x1) * w;
  return v
}

/**
  * setViewport set the viewport destination for the graphics commands
  * @param {number} x1 - abscissa of the upper left corner in pixels coordinates.
  * @param {number} y1 - ordinate of the upper left corner in pixels coordinates.
  * @param {number} x2 - abscissa of the lower right corner in pixels coordinates.
  * @param {number} y2 - ordinate of the lower right corner in pixels coordinates.
  */
function setViewport (x1, y1, x2, y2) {
  viewport = {x1: x1, y1: y1, x2: x2, y2: y2}
}

/**
 * setViewportBackGroundCOlor
 * @param {string} c - background color.
 */
function setViewportBackgroundColor(c){
  setFillStyle(c)
  vDrawFillRect({x:viewport.x1, y:viewport.y1},{x:viewport.x2, y:viewport.y2})
}

/**
 * setWindow set the window of the real world in world coordinates
 * @param {number} x1 - abscissa of the lower left corner in world coordinates.
 * @param {number} y1 - ordinate of the lower left corner in world coordinates.
 * @param {number} x2 - abscissa of the upper right corner in world coordinates.
 * @param {number} y2 - ordinate of the upper right corner in world coordinates.
 */
function setWindow (x1, y1, x2, y2) {
  worldWindow = {x1: x1, y1: y1, x2: x2, y2: y2}
}

/**
 * getWindowWidth return the current window width in world coordinates
 * @return {number} window's width in world coordinates.
 */
function getWindowWidth () {
  return worldWindow.x2-worldWindow.x1
}

/**
 * getWindowHeigth return the current window width in world coordinates

 * @return {number} window's height in world coordinates.
 */
function getWindowHeigth () {
  return worldWindow.y2-worldWindow.y1
}

/**
 * setClippingWindow set the clipping window on the real world in world coordinates
 * @param {number} x1 - abscissa of the lower left corner in world coordinates.
 * @param {number} y1 - ordinate of the lower left corner in world coordinates.
 * @param {number} x2 - abscissa of the upper right corner in world coordinates.
 * @param {number} y2 - ordinate of the upper right corner in world coordinates.
 */
function setClippingWindow (x1, y1, x2, y2) {
  clippingViewport = {x1: x1, y1: y1, x2: x2, y2: y2}
}

/**
 * setClipping set the clipping function
 * @param {boolean} c - if true the clipping function is activate.
 */
function setClipping (c) {
  clipping = !!c
}

/**
  * translatePoint translate the point p
  * @param {object} p - point to be translated.
  * @param {object} t - translation factor for the x,y and z axes point.
  */
function translatePoint (p, t) {
  return {x: p.x + t.x, y: p.y + t.y, z: p.z + t.z}
}

/**
  * scalePoint translate the point p
  * @param {object} p - point to be translated.
  * @param {object} s - scale factor for the x,y and z axes.
  */
function scalePoint (p, s) {
  return {x: p.x * s.x, y: p.y * s.y, z: p.z * s.z}
}

/**
 * rotatePoint rotate the point p around the origin
 * @param {object} p - point to be translated.
 * @param {object} r - rotation angle in degrees.
 */
function rotatePoint (p, r) {
  var s = Math.sin((Math.PI/180)*r)
  var c = Math.cos((Math.PI/180)*r)
  var xr = c * p.x - s * p.y
  var yr = s * p.x + c * p.y
  return {x: xr, y: yr}
}

/**
  * setColor sets the style for shapes' outlines.
  *Also, check out {@link https://www.w3schools.com/tags/canvas_strokestyle.asp|W3School} and
  *{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/strokeStyle|Mozilla}
  * @param {string} s - the style for shapes' outlines (passed to the graphic context).
  */
function setColor (c) {
  graphics.strokeStyle = c
}

/**
 * setFillStyle sets the style used when filling shapes
 * Also, check out {@link https://www.w3schools.com/tags/canvas_fillstyle.asp|W3School} and
 *{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/fillStyle|Mozilla}
 * @param {string} s - the fill style paramater (passed to the graphic context).
 */
function setFillStyle (s) {
  graphics.fillStyle = s
}

/**
 * createLinearGradientColor sets the style used when filling shapes with a gradient color (world coordinates)
 * Also, check out {@link https://www.w3schools.com/tags/canvas_createlineargradient.asp|W3School} and
 *{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient|Mozilla}
 * @param {object} sP - starting point of the gradient in world coordinates .
 * @param {object} eP - ending point of the gradient in world coordinates .
 * @param {array} colorStops -	an array containing the color stops of the gradient.
 */
function createLinearGradientColor (sP,eP,colorStops) {
  return vCreateLinearGradientColor(windowToViewportTransformation(sP),
                                    windowToViewportTransformation(eP), colorStops)
}

/**
 * createRadialGradientColor sets the style used when filling shapes with a radial radial color (world coordinates)
 * Also, check out {@link https://www.w3schools.com/tags/canvas_createlineargradient.asp|W3School} and
 *{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient|Mozilla}
 * @param {object} sP - center of the starting circle of the gradient in world coordinates .
 * @param {number} r1 - radius of the starting circle of the gradient in world coordinates .
 * @param {object} eP - center of the ending circle of the gradient in world coordinates .
 * @param {number} r2 - radius of the ending circle of the gradient in world coordinates .
 * @param {array} colorStops -	an array of objects {stop:stop, color:color} containing the color stops of the gradient.
 */
function createRadialGradientColor (sP,r1,eP,r2,colorStops) {
  return vCreateRadialGradientColor(windowToViewportTransformation(sP),windowToViewportScale(r1),
                                    windowToViewportTransformation(eP), windowToViewportScale(r2),
                                    colorStops)
}

/**
 * setLineCap set the line cap
 * * @param {string} c - the line cap ={"butt","round","square"}
 * Also, check out {@link https://www.w3schools.com/tags/canvas_linecap.asp|W3School} and
 *{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineCap|Mozilla}
 */
function setLineCap (c) {
  graphics.lineCap = c
}

/**
 * setLineWidth set the line width
 * * @param {number} lw - the line width in world coordinates
 * Also, check out {@link https://www.w3schools.com/tags/canvas_linewidth.asp|W3School} and
 *{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineWidth|Mozilla}
 */
function setLineWidth (lw) {
  var vlw = windowToViewportScale(lw)
  vSetLineWidth(vlw)
}

function drawArrow(wP1,wP2) {
  var vP1, vP2;
  vP1 = windowToViewportTransformation(wP1);
  vP2 = windowToViewportTransformation(wP2);
  vDrawArrow(vP1.x, vP1.y, vP2.x, vP2.y)
}

/**
 * drawPoint is a function used to draw a point in vP in world coordinates
 * @private
 * @param {object} wP - point in world coordinates.
 */
function drawPoint (vP) {
  vDrawPoint(windowToViewportTransformation(vP))
}


/**
 * drawLine draws a line from point vP1 to point vP2 in world coordinates
 * @param {object} vP1 - starting point in world coordinates.
 * @param {object} vP2 - ending point in world coordinates.
 */
function drawLine (wP1, wP2) {
  var vP1, vP2;
  vP1 = windowToViewportTransformation(wP1);
  vP2 = windowToViewportTransformation(wP2);
  vDrawLine(vP1, vP2)
}

/**
 * drawCircle draws a circle whose center is in vP1 and radius is r
 * @param {object} wP - center point in window coordinates.
 * @param {float}  wR - radius of the circle in viewport coordinates (pixels).
 */
function drawCircle (wP, wR) {
  var vP = windowToViewportTransformation(wP);
  var vR = windowToViewportScale(wR);
  vDrawCircle(vP, vR)
}

/**
 * drawOrientedSegment draws a line segment from point vP1 to point vP2 adding a circle in wP2 of radius wR
 * @param {object} wP1 - starting point in world coordinates.
 * @param {object} wP2 - ending point in world coordinates.
 * @param {number} wR  - radius of the circle in world coordinates.
 */
function drawOrientedSegment (wP1, wP2, wR) {
  drawLine(wP1, wP2);
  drawCircle(wP2, wR)
}

/**
 * drawRect draws a rectangle whose lower left corner is in vP1 and upper right corner is in vP2
 * @param {object} wP1 - lower left corner point in world coordinates.
 * @param {object} wP2 - upper right corner point in world coordinates.
 */
function drawRect (wP1, wP2) {
  var vP1, vP2;
  vP1 = windowToViewportTransformation(wP1);
  vP2 = windowToViewportTransformation(wP2);
  vDrawRect(vP1,vP2)
}

/**
 * drawRect draws a filled rectangle whose lower left corner is in vP1 and upper right corner is in vP2
 * @param {object} wP1 - lower left corner point in world coordinates.
 * @param {object} wP2 - upper right corner point in world coordinates.
 * @param {string} fs - string containing the filling color, gradient or pattern.
 */
function drawFillRect(wP1, wP2, fs) {
  var vP1, vP2;
  vP1 = windowToViewportTransformation(wP1);
  vP2 = windowToViewportTransformation(wP2);
  setFillStyle(fs);
  vDrawFillRect(vP1,vP2)
}

/**
 * drawPolyline draws an eventually filled polyline whose points are stored in the point's array wPs
 * @param {object} wPs - array of points in world coordinates.
 */
function drawPolyline (wPs) {
  var vPs = [];
  if (wPs.length > 2) {
    for (var i = 0; i < wPs.length; i++) {
      vPs.push(windowToViewportTransformation(wPs[i]))
    }
    vDrawPolyline(vPs)
  }
}

/**
 * drawStar draws  an eventually filled five pointed starpolyline whose points are stored in the point's array wPs
 * @param {object} wP - center point of the star in world coordinates.
 * @param {number} wP - radius of the star in world coordinates.
 */
function drawStar(wP,r) {
  vDrawStar(windowToViewportTransformation(wP),windowToViewportScale(r))
}

/**
 * drawText is a function used to draw a circle whose center is in vP1 and radius is r
 * @param {object} wP - point representing the position of the text to be drawn in world coordinates.
 * @param {string} s - string containing the text to be drawn.
 */
function drawText (wP, s) {
  var vP = windowToViewportTransformation(wP)
  vDrawText(vP,s);
}

/**
 * drawOutlinedText is a function used to draw a circle whose center is in vP1 and radius is r
 * @param {object} wP - point representing the position of the text to be drawn in world coordinates.
 * @param {string} s - string containing the text to be drawn.
 */
function drawOutlinedText (wP, s) {
  var vP = windowToViewportTransformation(wP)
  vDrawOutlinedText(vP,s);
}

/**
 * setTextFont sets the font and size for the next text to be drawn
 * @param {string} f - string containing the font size and name like '48px verdana'.
  * Also, check out {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/font|Mozilla}
 */
function setTextFont(f) {
  graphics.font = f
}

/**
 * setTextAlignment sets the font and size for the next text to be drawn
 * @param {string} a - string containing the alignment style  Possible values:
 * start, end, left, right or center. The default value is start.
 * Also, check out {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/textAlign|Mozilla}
 */
function setTextAlignment(a) {
  graphics.textAlign = a
}


/**
 * drawImage draws the imag image with its left-top corner in vdp (world coordinates)
 * Also, check out {@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/drawImage|Mozilla}
 * @param {object} wdp - the image's left-top corner in  world coordinates .
 * @param {object} image - the image to be drawn .
 */
function drawImage(wdp,image) {
  var vdp = windowToViewportTransformation(wdp)
  vDrawImage(vdp,image)
}


/**
 * drawBezier draws a bezier curve with starting point sp, first control point cp1
 * second control point cp2 and ending point ep
 * @param {Object[]} sp - starting point  in world coordinates.
 * @param {Object[]} cp1 - first control point  in world coordinates.
 * @param {Object[]} cp2 - second control point  in world coordinates.
 * @param {Object[]} ep - ending  point  in world coordinates.
 */
function drawBezier (sp,cp1,cp2,ep) {
  var vsp = windowToViewportTransformation(sp)
  var vcp1 = windowToViewportTransformation(cp1)
  var vcp2 = windowToViewportTransformation(cp2)
  var vep = windowToViewportTransformation(ep)
  vDrawBezier(vsp,vcp1,vcp2,vep)
}
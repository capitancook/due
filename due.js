var viewport = {x1: 0, y1: 0, x2: 100, y2: 100};
var worldWindow = {x1: 0, y1: 0, x2: 1000, y2: 1000};
var clippingViewport
var clipping = false
var graphicCanvas, graphics;

graphicCanvas = document.getElementById('viewport');
graphics = graphicCanvas.getContext('2d');

//------------------------------------DRIVER START-----------------------------------------------------------------------


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
  * vDrawCircle is a viewport function used to draw a circle whose center is in vP1 and radius is r
  * @private
  * @param {object} vP - center point in viewport coordinates.
  * @param {float} r - radius of the circle in viewport coordinates (pixels).
  */
function vDrawCircle (vP, r) {
  graphics.beginPath();
  graphics.arc(vP.x, vP.y, r, 0, Math.PI * 2, true);
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

//------------------------------------DRIVER END-----------------------------------------------------------------------

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
  drawFillRect({x:worldWindow.x1, y:worldWindow.y1},{x:worldWindow.x2, y:worldWindow.y2})
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
  var xr = Math.cos((2*Math.PI/360)*r) * p.x - Math.sin((2*Math.PI/360)*r) * p.y
  var yr = Math.sin((2*Math.PI/360)*r) * p.x + Math.cos((2*Math.PI/360)*r) * p.y
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
 * * @param {number} lw - the line cap ={"butt","round","square"}
 * Also, check out {@link https://www.w3schools.com/tags/canvas_linewidth.asp|W3School} and
 *{@link https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/lineWidth|Mozilla}
 */
function setLineWidth (lw) {
  graphics.lineWidth = lw
}

function drawArrow(wP1,wP2) {
  var vP1, vP2;
  vP1 = windowToViewportTransformation(wP1);
  vP2 = windowToViewportTransformation(wP2);
  vDrawArrow(vP1.x, vP1.y, vP2.x, vP2.y)
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

function drawStar(wP,r) {
  vDrawStar(windowToViewportTransformation(wP),windowToViewportScale(r))
}

var mouse = { //make a globally available object with x,y attributes
  x: 0,
  y: 0
}
graphicCanvas.onmousemove = function (event) { // this  object refers to canvas object
  mouse = {
    x: event.pageX - this.offsetLeft,
    y: event.pageY - this.offsetTop
  }
}
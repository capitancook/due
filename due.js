var viewport = {x1: 0, y1: 0, x2: 100, y2: 100};
var worldWindow = {x1: 0, y1: 0, x2: 1000, y2: 1000};
var canvas, graphics;

canvas = document.getElementById('viewport');
graphics = canvas.getContext('2d');

/**
 * windowToViewportTransformation transforms a point in world coordinate in a point in viewport coordinate
 * @param {object} wP - a point in world coordinate.
 */
function windowToViewportTransformation (wP) {
  var xv, yv, vP;
  xv = ((viewport.x2 - viewport.x1) / (worldWindow.x2 - worldWindow.x1) * (wP.x - worldWindow.x1) + viewport.x1);
  yv = canvas.height - ((viewport.y2 - viewport.y1) / (worldWindow.y2 - worldWindow.y1) * (wP.y - worldWindow.y1) + viewport.y1);
  vP = {x: xv, y: yv};
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
 * vDrawLine is a viewport function used to draw a line from point vP1 to point vP2 in viewport coordinates
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
 * vDrawPolyline is a viewport function used to draw a polyline passing truogh the points
 * vPoints[0], vPoints[1], vPoints[vPoints.length-1]. Note that:
 * 1) the polyline is automatically closed, this means that
 * if  vPoints[vPoints.length-1] <> vPoints[0] a line bteween these points is drawn to
 * close the polyline;
 * 2) the polylin is drawn only if there are more than two point in the vPoints array.
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
  * @param {object} vP - center point in viewport coordinates.
  * @param {float} r - radius of the circle in viewport coordinates (pixels).
  */
function vDrawCircle (vP, r) {
  graphics.beginPath();
  graphics.arc(vP.x, vP.y, r, 0, Math.PI * 2, true);
  graphics.stroke()
}
/**
  * vDrawArrow is a viewport function used to draw an arrow from point vP1 to point vP2
  * in viewport coordinates
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

// front end

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
  * setWindow set the window of the real world in world coordinates
  * @param {number} x1 - abscissa of the upper left corner in world coordinates.
  * @param {number} y1 - ordinate of the upper left corner in world coordinates.
  * @param {number} x2 - abscissa of the lower right corner in world coordinates.
  * @param {number} y2 - ordinate of the lower right corner in world coordinates.
  */
function setWindow (x1, y1, x2, y2) {
  worldWindow = {x1: x1, y1: y1, x2: x2, y2: y2}
}

/**
  * translatePoint translate the point p  in world coordinates
  * @param {object} p - point to be translated in world coordinates.
  * @param {object} T - translation point in world coordinates.
  */
function translatePoint (p, T) {
  return {x: p.x + T.x, y: p.y + T.y, z: p.z + T.z}
}

/**
  * translatePoint translate the point p  in world coordinates
  * @param {object} p - point to be translated in world coordinates.
  * @param {object} T - translation point in world coordinates.
  */
function scalePoint (p, s) {
  return {x: p.x * s.x, y: p.y * s.y, z: p.z * s.z}
}

/**
  * SetColor set the color translate the point p  in world coordinates
  * @param {string} c - the color of the.
  */
function setColor (c) {
  graphics.strokeStyle = c
}

function setFillColor (c) {
  graphics.fillStyle = c
}

function setLineCap (c) {
  graphics.lineCap = c
}

function setLineWidth (wlw) {
  var vlw = windowToViewportScale(wlw);
  graphics.lineWidth = vlw
}

function drawArrow(wP1,wP2) {
  var vP1, vP2;
  vP1 = windowToViewportTransformation(wP1);
  vP2 = windowToViewportTransformation(wP2);
  vDrawArrow(vP1.x, vP1.y, vP2.x, vP2.y)
}

function drawCircle (wP, wR) {
  var vP = windowToViewportTransformation(wP);
  var vR = windowToViewportScale(wR);
  vDrawCircle(vP, vR)
}

function drawLine (wP1, wP2) {
  var vP1, vP2;
  vP1 = windowToViewportTransformation(wP1);
  vP2 = windowToViewportTransformation(wP2);
  vDrawLine(vP1, vP2)
}

function drawOrientedSegment (wP1, wP2, wR) {
  drawLine(wP1, wP2);
  drawCircle(wP2, wR)
}

function drawRect (wP1, wP2) {
  var vP1, vP2;
  vP1 = windowToViewportTransformation(wP1);
  vP2 = windowToViewportTransformation(wP2);
  vDrawRect(vP1,vP2)
}

function drawFillRect(wP1, wP2, fc) {
  var vP1, vP2;
  vP1 = windowToViewportTransformation(wP1);
  vP2 = windowToViewportTransformation(wP2);
  setFillColor(fc);
  vDrawRect(vP1,vP2)
}

function drawPolyline (wPs) {
  var vPs = [];
  if (wPs.length > 2) {
    for (var i = 0; i < wPs.length; i++) {
      vPs.push(windowToViewportTransformation(wPs[i]))
    }
    vDrawPolyline(vPs)
  }
}


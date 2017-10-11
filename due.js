  var viewport = {x1: 0, y1: 0, x2: 100, y2: 100}
  var worldWindow = {x1: 0, y1: 0, x2: 1000, y2: 1000}
  var canvas, graphics

  canvas = document.getElementById('viewport')
  graphics = canvas.getContext('2d')

  function windowToViewportTransformation (wP) {
    var xv, yv, vP
    xv = ((viewport.x2 - viewport.x1) / (worldWindow.x2 - worldWindow.x1) * (wP.x - worldWindow.x1) + viewport.x1)
    yv = canvas.height - ((viewport.y2 - viewport.y1) / (worldWindow.y2 - worldWindow.y1) * (wP.y - worldWindow.y1) + viewport.y1)
    vP = {x: xv, y: yv}
//     console.log(vP);
    return vP
  }

  function windowToViewportScale (w) {
    var v
    v = (viewport.x2 - viewport.x1) / (worldWindow.x2 - worldWindow.x1) * w
    return v
  }

  function vDrawLine (p1, p2) {
    graphics.beginPath()
    graphics.moveTo(p1.x, p1.y)
    graphics.lineTo(p2.x, p2.y)
    graphics.stroke()
  }

  function vDrawCircle (vP, r) {
    graphics.beginPath()
    graphics.arc(vP.x, vP.y, r, 0, Math.PI * 2, true)
    graphics.stroke()
  }

  // front end

  function setViewport (x1, y1, x2, y2) {
    viewport = {x1: x1, y1: y1, x2: x2, y2: y2}
  }

  function setWindow (x1, y1, x2, y2) {
    worldWindow = {x1: x1, y1: y1, x2: x2, y2: y2}
  }

  function translatePoint (p, T) {
    return {x: p.x + T.x, y: p.y + T.y, z: p.z + T.z}
  }

  function scalePoint (p, s) {
    return {x: p.x * s.x, y: p.y * s.y, z: p.z * s.z}
  }

  function drawCircle (wP, wR) {
    var vP = windowToViewportTransformation(wP)
    var vR = windowToViewportScale(wR)
//    window.alert("vP = "+ vP.x +" , " + vP.y + ", r = " + vR);
    vDrawCircle(vP, vR)
  }

  function drawLine (wP1, wP2) {
    var vP1, vP2
    vP1 = windowToViewportTransformation(wP1)
    vP2 = windowToViewportTransformation(wP2)
    vDrawLine(vP1, vP2)
  }

  function drawOrientedSegment (wP1, wP2, wR) {
    drawLine(wP1, wP2)
    drawCircle(wP2, wR)
  }

  function drawRect (wP1, wP2) {
    var p1, p2, p3, p4
    p1 = wP1
    p2 = {x: wP1.x, y: wP2.y}
    p3 = wP2
    p4 = {x: wP2.x, y: wP1.y}
    drawLine(p1, p2)
    drawLine(p2, p3)
    drawLine(p3, p4)
    drawLine(p4, p1)
  }

  function setColor (c) {
    graphics.strokeStyle = c
  }


var Vertex = function(x, y, z) {
  this.x = parseFloat(x);
  this.y = parseFloat(y);
  this.z = parseFloat(z);
};

/**
 * translateVertex translate the vertex p
 * @param {object} p - vertex to be translated.
 * @param {object} t - translation factor for the x,y and z axes point.
 */
function translateVertex (p, t) {
  return {x: p.x + t.x, y: p.y + t.y, z: p.z + t.z}
}

/**
 * scalePoint scale the vertex p
 * @param {object} p - vertex to be translated.
 * @param {object} s - scale factor for the x,y and z axes.
 */
function scaleVertex (p, s) {
  return {x: p.x * s.x, y: p.y * s.y, z: p.z * s.z}
}

/**
 * rotateVertex rotate the vertex p around the origin
 * @param {object} p - vertex to be translated.
 * @param {object} r - rotation angle in degrees.
 */
function rotateVertex (p, r) {
  var c = Math.cos((Math.PI/180)*r)
  var s = Math.sin((Math.PI/180)*r)
  var xr = c * p.x - s * p.y
  var yr = s * p.x + c * p.y
  return {x: xr, y: yr}
}



var Cube = function(center, side) {
  // Generate the vertices
  var d = side / 2;

  this.vertices = [
    new Vertex(center.x - d, center.y - d, center.z + d),
    new Vertex(center.x - d, center.y - d, center.z - d),
    new Vertex(center.x + d, center.y - d, center.z - d),
    new Vertex(center.x + d, center.y - d, center.z + d),
    new Vertex(center.x + d, center.y + d, center.z + d),
    new Vertex(center.x + d, center.y + d, center.z - d),
    new Vertex(center.x - d, center.y + d, center.z - d),
    new Vertex(center.x - d, center.y + d, center.z + d)
  ];

  // Generate the faces
  this.faces = [
    [0, 1, 2, 3],
    [3, 2, 5, 4],
    [4, 5, 6, 7],
    [7, 6, 1, 0],
    [7, 0, 3, 4],
    [1, 6, 5, 2]
  ];
};

var dodecahedronIFS =
  {
    "vertices": [
      new Vertex(-1.000000, 0.000000, -0.381966),
      new Vertex(0.618034, 0.618034, 0.618034),
      new Vertex(1.000000, 0.000000, 0.381966),
      new Vertex(0.618034, -0.618034, 0.618034),
      new Vertex(0.000000, -0.381966, 1.000000),
      new Vertex(0.000000, 0.381966, 1.000000),
      new Vertex(1.000000, 0.000000, -0.381966),
      new Vertex(0.618034, 0.618034, -0.618034),
      new Vertex(0.381966, 1.000000, 0.000000),
      new Vertex(-0.381966, 1.000000, 0.000000),
      new Vertex(-0.618034, 0.618034, -0.618034),
      new Vertex(0.000000, 0.381966, -1.000000),
      new Vertex(0.618034, -0.618034, -0.618034),
      new Vertex(0.381966, -1.000000, 0.000000),
      new Vertex(-0.381966, -1.000000, 0.000000),
      new Vertex(-1.000000, 0.000000, 0.3819669),
      new Vertex(-0.618034, 0.618034, 0.618034),
      new Vertex(-0.618034, -0.618034, -0.618034),
      new Vertex(0.000000, -0.381966, -1.000000),
      new Vertex(-0.618034, -0.618034, 0.618034)
    ],
    "faces": [
      [16,9,8,1,5],
      [9,10,11,7,8],
      [8,7,6,2,1],
      [6,12,13,3,2],
      [18,17,14,13,12],
      [14,19,4,3,13],
      [4,5,1,2,3],
      [15,16,5,4,19],
      [7,11,18,12,6],
      [10,0,17,18,11],
      [0,10,9,16,15],
      [17,0,15,19,14]
    ],
    "faceNormals": [
      [0.000000,-0.850651,-0.525731],
      [0.000000,-0.850651,0.525731],
      [-0.850651,-0.525731,0.000000],
      [-0.850651,0.525731,0.000000],
      [0.000000,0.850651,0.525731],
      [0.000000,0.850651,-0.525731],
      [-0.525731,-0.000000,-0.850651],
      [0.525731,0.000000,-0.850651],
      [-0.525731,0.000000,0.850651],
      [0.525731,0.000000,0.850651],
      [0.850651,-0.525731,0.000000],
      [0.850651,0.525731,-0.000000]
    ]
  }



function project(M) {

  // Distance between the camera and the plane
  var d = 20;
  var r = d / M.z;

  return new Point(r * M.x, r * M.y);
}

function render(objects, ctx, dx, dy) {
  // Clear the previous frame
  ctx.clearRect(0, 0, 2*dx, 2*dy);

  // For each object
  for (var i = 0, n_obj = objects.length; i < n_obj; ++i) {
    // For each face
    for (var j = 0, n_faces = objects[i].faces.length; j < n_faces; ++j) {
      // Current face
      var face = objects[i].faces[j]
      var faceVertices = objects[i].vertices
      // Draw the first vertex
      var P = project(faceVertices[face[0]]);
      ctx.beginPath();
      ctx.moveTo(P.x + dx, -P.y + dy);

      // Draw the other vertices
      for (var k = 1, n_vertices = face.length; k < n_vertices; ++k) {
        P = project(faceVertices[face[k]]);
        ctx.lineTo(P.x + dx, -P.y + dy);
      }

      // Close the path and draw the face
      ctx.closePath();
      ctx.stroke();
      ctx.fill();
    }
  }
}

(function() {
  // Fix the canvas width and height
  var canvas = document.getElementById('cnv');
  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
  var dx = canvas.width / 2;
  var dy = canvas.height / 2;

  // Objects style
  var ctx = canvas.getContext('2d');
  ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
  ctx.fillStyle = 'rgba(0, 150, 255, 0.3)';

  // Create the cube
  var cube_center = new Vertex(0, 0,0);
  var cube = new Cube(cube_center, 2);
  var objects = [cube, dodecahedronIFS];

  // First render
  render(objects, ctx, dx, dy);

  // Events
  var mousedown = false;
  var mx = 0;
  var my = 0;

  canvas.addEventListener('mousedown', initMove);
  document.addEventListener('mousemove', move);
  document.addEventListener('mouseup', stopMove);

  // Rotate a vertice
  function rotate(M, center, theta, phi) {
    // Rotation matrix coefficients
    var ct = Math.cos(theta);
    var st = Math.sin(theta);
    var cp = Math.cos(phi);
    var sp = Math.sin(phi);

    // Rotation
    var x = M.x - center.x;
    var y = M.y - center.y;
    var z = M.z - center.z;

    M.x = ct * x - st * cp * y + st * sp * z + center.x;
    M.y = st * x + ct * cp * y - ct * sp * z + center.y;
    M.z = sp * y + cp * z + center.z;
  }

  // Initialize the movement
  function initMove(evt) {
    clearTimeout(autorotate_timeout);
    mousedown = true;
    mx = evt.clientX;
    my = evt.clientY;
  }

  function move(evt) {
    if (mousedown) {
      var theta = (evt.clientX - mx) * Math.PI / 360;
      var phi = (evt.clientY - my) * Math.PI / 180;
      for (var j = 0; j < objects.length; j++)
        for (var i = 0; i < objects[j].vertices.length; ++i)
          rotate(objects[j].vertices[i], cube_center, theta, phi);


      mx = evt.clientX;
      my = evt.clientY;

      render(objects, ctx, dx, dy);
    }
  }

  function stopMove() {
    mousedown = false;
    autorotate_timeout = setTimeout(autorotate, 2000);
  }

  function autorotate() {
    for (var i = 0; i < 8; ++i)
      rotate(cube.vertices[i], cube_center, -Math.PI / 720, Math.PI / 720);

    render(objects, ctx, dx, dy);

    autorotate_timeout = setTimeout(autorotate, 30);
  }
  autorotate_timeout = setTimeout(autorotate, 2000);
})();
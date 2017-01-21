window.addEventListener('load', init, false);

var canvas, ctx, points, gravity;
var width, height, mouse;

var s = {
  num_points: 1,
  gravity: 10,
  mousemass: 10,
}

class Point {
  constructor() {
    this.vx = Math.random();
    this.vy = Math.random();
    this.px = Math.random();
    this.py = Math.random();
    this.mass = Math.random();
  }
  
  update() {
    var x = mouse.x;
    var y = mouse.y;
    
    var dx = mouse.x - x;
    var dy = mouse.y - y;
    
    var theta = Math.arctan(dy/dx);
    
    // a = GM/r*r
    var a = G*s.mousemass / (r*r);
    var ax = a*Math.cos(theta);
    var ay = a*Math.sin(theta);
        
    // s = ut + 0.5at*t
    this.px += this.vx*delta + 0.5*ax*delta*delta;
    this.py += this.vy*delta + 0.5*ay*delta*delta;
    
    // v = u + at
    this.vx += ax*s.delta;
    this.vy += ay*s.delta;
  }
  
}

function init() {

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");
  
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
  
  canvas.addEventListener("mousemove", getMousePos, false);
  console.log("ok");
  // points = assignPoints(POINTS);
  window.requestAnimationFrame(draw);
}

function draw() {
  var i;
  console.log("yeah");
  console.log(mouse.x, mouse.y);
  // Transparency code
  
  // Add and delete points if necessary
  if(points.length < s.num_points) {
    points = points.concat(assignPoints(s.num_points - points.length));
  } else if(points.length > s.num_points) {
    points = removePoints(points, points.length - s.num_points);
  }  
  // Update all points
  for(i = 0; i < points.length; i++) {
    points[i].update();
  }
  // Draw all points
  
  window.requestAnimationFrame(draw);
}

function assignPoints(no_points) {
  pts = [];
  
}

function removePoints(points, num_points) {
  var pts = points.slice();
  
}
function getMousePos(e) {
  console.log("here");
  var rect = canvas.getBoundingClientRect();
  mouse = {
    x: Math.round((e.clientX-rect.left)/(rect.right-rect.left)*width),
    y: Math.round((e.clientY-rect.top)/(rect.bottom-rect.top)*height)
  };
  return;
}
window.addEventListener('load', init, false);

var canvas, ctx, points, gravity;
var width, height;
var mouse;
// var mouse = {
//   x: 0,
//   y: 0,
// };
var vinit = 1;

window.requestAnimationFrame = (function(){
  return  window.requestAnimationFrame       ||
          window.webkitRequestAnimationFrame ||
          window.mozRequestAnimationFrame    ||
          window.oRequestAnimationFrame      ||
          window.msRequestAnimationFrame     ||
          function (callback) {
              window.setTimeout(callback, 1000 / 60);
          };
})();

var s = {
  num_points: 100,
  mousemass: 150,
}

var gui = new dat.GUI();

gui.add(s, "num_points").min(50).max(200).step(1).name("No. of points");
gui.add(s, "mousemass").min(75).max(400).step(1).name("Mouse mass");
gui.close();

class Point {
  constructor(w, h) {
    this.vx = Math.random()*2*vinit-vinit;
    this.vy = Math.random()*2*vinit-vinit;
    this.px = Math.floor(Math.random()*w);
    this.py = Math.floor(Math.random()*h);
    // this.mass = Math.random();
  }

  update(mouse) {
    if(mouse) {
      var dx = mouse.x - this.px;
      var dy = mouse.y - this.py;

      var force = s.mousemass / Math.pow((dx*dx+s.mousemass/2+dy*dy+s.mousemass/2), 1.4);

      var ax = force*dx;
      var ay = force*dy;

      this.vx += ax;
      this.vy += ay;
    }

    this.px += this.vx;
    this.py += this.vy;

    if(this.px < 0 || this.px > width) {
      this.vx *= -1;
    }
    if(this.py < 0 || this.py > height) {
      this.vy *= -1;
    }
  }
}

function init() {

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  // Init mouse coordinates
  // mouse = {
  //   x: width/2,
  //   y: height/2,
  // };

  canvas.addEventListener("mousemove", getMousePos, false);
  canvas.addEventListener("touchmove", getMousePos, false);
  canvas.addEventListener("mousedown", function() {
    s.mousemass *= s.mousemass > 0 ? -1 : 1;
  }, false);
  canvas.addEventListener("mouseup", function() {
    s.mousemass *= s.mousemass < 0 ? -1 : 1;
  }, false);
  canvas.addEventListener("mouseleave", function(e) {
    mouse = null;
  }, false);


  points = assignPoints(s.num_points);
  window.requestAnimationFrame(draw);
}

function draw() {
  var i;

  // Add and delete points if necessary
  if(points.length < s.num_points) {
    points = points.concat(assignPoints(s.num_points - points.length));
  } else if(points.length > s.num_points) {
    points = removePoints(points, s.num_points);
  }
  // Update all points
  for(i = 0; i < points.length; i++) {
    points[i].update(mouse);
  }
  // Transparency code
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(0, 51, 51, 0.6)';
  ctx.fillRect(0, 0, width, height);

  if(mouse) {
    var gradient = ctx.createRadialGradient(mouse.x, mouse.y, Math.abs(s.mousemass*0.75), mouse.x, mouse.y, Math.max(width, height));
    gradient.addColorStop(0,"rgba(0, 0, 0, 0)");
    gradient.addColorStop(1,"black");
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
  }

  // Draw all points
  for(i = 0; i < points.length; i++) {
    var pt = points[i];
    ctx.moveTo(Math.round(pt.px), Math.round(pt.py));
    ctx.arc(Math.round(pt.px), Math.round(pt.py), 1, 0, 2*Math.PI);
    ctx.fillStyle = 'rgb(255, 255, 255)';
    ctx.fill();
  }
  ctx.restore();

  window.requestAnimationFrame(draw);
}

function assignPoints(no_points) {
  var i;
  var a = [];
  for(i = 0; i < no_points; i++) {
    var pt = new Point(width, height);
    a.push(pt);
  }
  return a;
}

function removePoints(points, limit) {
  var len = points.length;
  while(len > limit) {
    points.splice(Math.floor(Math.random()*len), 1);
    len--;
  }
  return points;
}
function getMousePos(e) {
  var rect = canvas.getBoundingClientRect();
  mouse = {
    x: Math.round((e.clientX-rect.left)/(rect.right-rect.left)*width),
    y: Math.round((e.clientY-rect.top)/(rect.bottom-rect.top)*height)
  };
  return;
}

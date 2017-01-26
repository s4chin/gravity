window.addEventListener('load', init, false);

var canvas, ctx, points, gravity;
var width, height;
var mouse;
var vinit = 1;
var clicked;
var explosion = false;
const speed_cap = 10;

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
  mousemass: 160,
  friction: 0.01,
}

var gui = new dat.GUI();

gui.add(s, "num_points").min(50).max(200).step(1).name("No. of points");
gui.add(s, "mousemass").min(75).max(400).step(1).name("Mouse mass");
gui.add(s, "friction").min(0).max(1).step(0.01).name("Friction");
gui.close();

class Point {
  constructor(w, h) {
    this.vx = Math.random()*2*vinit-vinit;
    this.vy = Math.random()*2*vinit-vinit;
    this.px = Math.floor(Math.random()*w);
    this.py = Math.floor(Math.random()*h);
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

    if(this.vx > speed_cap || this.vx < -speed_cap) {
      this.vx = this.vx > 0 ? speed_cap : -speed_cap;
    }
    if(this.vy > speed_cap || this.vy < -speed_cap) {
      this.vy = this.vy > 0 ? speed_cap : -speed_cap;
    }

    // Add friction so they don't move at constant speed without interference
    this.vx *= (1 - s.friction);
    this.vy *= (1 - s.friction);

    this.px += this.vx;
    this.py += this.vy;

    // Make stuff harder to go off screen
    if(this.px < 0 || this.px > width) {
      this.vx *= -1;
      this.px = this.px < 0 ? 0 : width;
    }
    if(this.py < 0 || this.py > height) {
      this.vy *= -1;
      this.py = this.py < 0 ? 0 : height;
    }
  }
}

function init() {

  canvas = document.getElementById("canvas");
  ctx = canvas.getContext("2d");

  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;

  canvas.addEventListener("mousemove", getMousePos, false);
  canvas.addEventListener("touchmove", getMousePos, false);
  canvas.addEventListener("mousedown", function() {
    s.mousemass *= s.mousemass > 0 ? -1 : 1;
    clicked = true;
  }, false);
  canvas.addEventListener("mouseup", function() {
    s.mousemass *= s.mousemass < 0 ? -1 : 1;
    clicked = false;
  }, false);
  canvas.addEventListener("mouseleave", function(e) {
    mouse = null;
  }, false);
  canvas.addEventListener("dblclick", explode, false);

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
  if(!explosion) {
    for(i = 0; i < points.length; i++) {
      points[i].update(mouse);
    }
  } else {
    explosion = false;
  }
  // Transparency code
  ctx.save();
  ctx.beginPath();
  ctx.fillStyle = 'rgba(0, 20, 20, 0.6)';
  ctx.fillRect(0, 0, width, height);

  if(mouse) {
    var gradient = ctx.createRadialGradient(mouse.x, mouse.y, Math.abs(s.mousemass*0.75), mouse.x, mouse.y, Math.max(width, height));
    if(!clicked) {
      gradient.addColorStop(0,"rgba(0, 51, 51, 0.6)");
      gradient.addColorStop(1,"black");
    } else {
      gradient.addColorStop(1,"rgba(0, 51, 51, 0.6)");
      gradient.addColorStop(0,"rgba(0, 20, 20, 0.6)");
    }
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

function explode(e) {
  e.preventDefault();
  var mmass = s.mousemass;
  s.mousemass = -10000;
  explosion = true;
  for(i = 0; i < points.length; i++) {
    points[i].update(mouse);
  }
  s.mousemass = mmass;
}

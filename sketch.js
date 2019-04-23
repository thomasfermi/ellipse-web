let colloids;


function setup() {
  createCanvas(400, 400);
  createP("Click into the canvas to create a colloid.");
  colloids = new SystemOfColloids();
}

function draw() {
  background(0,0,170);
  colloids.run();
}

function mouseClicked() {
  colloids.addColloid(new Colloid(mouseX, mouseY));
}


function SystemOfColloids() {
  this.colloids = [];
}

SystemOfColloids.prototype.run = function() {
  for (let i = 0; i < this.colloids.length; i++) {
    this.colloids[i].run();
  }
}

SystemOfColloids.prototype.addColloid = function(c) {
  this.colloids.push(c);
}


function Colloid(x, y) {
  this.r = 20;
  let m = 10;
  this.vel = createVector(random(-m, m), random(-m, m));
  this.pos = createVector(x, y);
}

Colloid.prototype.run = function() {
  this.update();
  this.pbc();
  this.render();
}

Colloid.prototype.render = function() {
  ellipse(this.pos.x, this.pos.y, this.r, this.r);
}

Colloid.prototype.update = function() {
  let dt = 0.1;
  this.pos.add(p5.Vector.mult(this.vel,dt));
}

// Periodic Boundary Conditions
Colloid.prototype.pbc = function() {
  if (this.pos.x < -this.r) this.pos.x = width + this.r;
  if (this.pos.y < -this.r) this.pos.y = height + this.r;
  if (this.pos.x > width + this.r) this.pos.x = -this.r;
  if (this.pos.y > height + this.r) this.pos.y = -this.r;
}

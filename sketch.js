let colloids;
var R = 10;
var Sigma = 1;
var Sigma_sq = Sigma * Sigma;
var Eps = 1;
var MD_steps_per_frame = 100;

//TODO: - tidy up code, e.g. CamelCase <-> snake_case
//      - when user adds colloid, make sure that there is space for it
//      - tune parameters for numerical stability
//      - add verlet list or similar for speed up of force calculations

let minimum_image = function(r) {
  if (r.x > width * 0.5) r.x = r.x - width;
  if (r.x <= -width * 0.5) r.x = r.x + width;
  if (r.y > height * 0.5) r.y = r.y - height;
  if (r.y <= -height * 0.5) r.y = r.y + height;
  return r;
}

function setup() {
  createCanvas(400, 400);
  createP("Click into the canvas to create a colloid.");
  colloids = new SystemOfColloids();
}

function draw() {
  background(0, 0, 170);
  colloids.run();
}

function mouseClicked() {
  colloids.addColloid(new Colloid(mouseX, mouseY));
}


function SystemOfColloids() {
  this.colloids = [];
}

SystemOfColloids.prototype.run = function() {
  let dt = 0.01;

  for (let md_step = 0; md_step < MD_steps_per_frame; md_step++) {

    //velocity verlet position update
    var Forces = this.calculateForces();
    for (let i = 0; i < this.colloids.length; i++) {
      this.colloids[i].pos.add(p5.Vector.mult(this.colloids[i].vel, dt));
      let acc_term = p5.Vector.mult(Forces[i], dt * dt * 0.5 / this.colloids[i].mass);
      this.colloids[i].pos.add(acc_term);
      this.colloids[i].pbc();
    }

    //velocity verlet velocity update
    var ForcesNew = this.calculateForces();
    for (let i = 0; i < this.colloids.length; i++) {
      let acc_term = p5.Vector.add(Forces[i], ForcesNew[i]);
      this.colloids[i].vel.add(p5.Vector.mult(acc_term, dt * 0.5 / this.colloids[i].mass));
    }

  }


  for (let i = 0; i < this.colloids.length; i++) {
    this.colloids[i].render();
  }

}

SystemOfColloids.prototype.calculateForces = function() {

  var Forces = [];
  for (let i = 0; i < this.colloids.length; i++) {
    Forces.push(createVector(0.0, 0.0));
  }

  //compute force via pairwise lennard jones interaction
  for (let i = 0; i < this.colloids.length; i++) {
    for (let j = i + 1; j < this.colloids.length; j++) {
      let r_ij = p5.Vector.sub(this.colloids[j].pos, this.colloids[i].pos); //use MIC!
      r_ij = minimum_image(r_ij);
      let d_ij = r_ij.mag() - 2 * R; //this.r, this.r
      let e_ij = p5.Vector.div(r_ij, r_ij.mag());

      if (d_ij < 1.12 * Sigma) {
        let fraction = (Sigma / (d_ij + Sigma));
        let F_ij = p5.Vector.mult(e_ij,
          -24 * (Eps / Sigma) * (2 * Math.pow(fraction, 13) - Math.pow(fraction, 7)));

        Forces[i].add(F_ij);
        Forces[j].sub(F_ij);
      }
    }
  }
  return Forces;

}

SystemOfColloids.prototype.addColloid = function(c) {
  this.colloids.push(c);
}


function Colloid(x, y) {
  let m = 1;
  this.vel = createVector(random(-m, m), random(-m, m));
  this.mass = 300;
  this.pos = createVector(x, y);
  this.force = createVector(0.0, 0.0);
}



Colloid.prototype.render = function() {
  circle(this.pos.x, this.pos.y, R);
}



// Periodic Boundary Conditions
Colloid.prototype.pbc = function() {
  if (this.pos.x < 0) this.pos.x = width + this.pos.x;
  if (this.pos.x > width) this.pos.x = this.pos.x - width;
  if (this.pos.y < 0) this.pos.y = height + this.pos.y;
  if (this.pos.y > height) this.pos.y = this.pos.y - height;

}

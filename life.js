class Animal {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.energy = 50;
  }
}

class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

const canvas = document.getElementById('world');
const ctx = canvas.getContext('2d');
let width, height;

function resize() {
  width = canvas.width = window.innerWidth;
  height = canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize();

const animals = [];
const foods = [];

function addAnimal(x, y) {
  animals.push(new Animal(x, y));
}

function addFood(x, y) {
  foods.push(new Food(x, y));
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  addFood(x, y);
});

function update() {
  // animals move randomly
  for (const a of animals) {
    a.x += Math.random() * 4 - 2;
    a.y += Math.random() * 4 - 2;
    a.x = Math.max(0, Math.min(width, a.x));
    a.y = Math.max(0, Math.min(height, a.y));
    a.energy -= 0.1;

    // eat food
    for (let i = foods.length - 1; i >= 0; i--) {
      const f = foods[i];
      const dx = a.x - f.x;
      const dy = a.y - f.y;
      if (dx * dx + dy * dy < 100) { // within 10px
        foods.splice(i, 1);
        a.energy += 20;
        break;
      }
    }

    if (a.energy > 80) {
      a.energy /= 2;
      addAnimal(a.x + Math.random() * 10 - 5, a.y + Math.random() * 10 - 5);
    }
  }

  // remove animals with no energy
  for (let i = animals.length - 1; i >= 0; i--) {
    if (animals[i].energy <= 0) {
      animals.splice(i, 1);
    }
  }
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, width, height);

  // draw foods
  for (const f of foods) {
    ctx.fillStyle = 'green';
    ctx.fillRect(f.x - 2, f.y - 2, 4, 4);
  }

  // draw animals
  for (const a of animals) {
    ctx.fillStyle = 'white';
    ctx.fillRect(a.x - 3, a.y - 3, 6, 6);
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

addAnimal(width / 2, height / 2);
loop();

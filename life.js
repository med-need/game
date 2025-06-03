class Animal {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = Math.random() * 2 - 1;
    this.vy = Math.random() * 2 - 1;
    this.energy = 50;
    this.color = `hsl(${Math.random() * 360},70%,60%)`;
  }

  update() {
    let target = null;
    let best = Infinity;
    for (const f of foods) {
      const dx = f.x - this.x;
      const dy = f.y - this.y;
      const d = dx * dx + dy * dy;
      if (d < best) {
        best = d;
        target = f;
      }
    }
    if (target) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.vx += (dx / dist) * 0.2;
      this.vy += (dy / dist) * 0.2;
    } else {
      this.vx += Math.random() * 0.2 - 0.1;
      this.vy += Math.random() * 0.2 - 0.1;
    }

    const speed = Math.hypot(this.vx, this.vy);
    if (speed > 2) {
      this.vx *= 2 / speed;
      this.vy *= 2 / speed;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
    this.x = Math.max(0, Math.min(width, this.x));
    this.y = Math.max(0, Math.min(height, this.y));

    for (let i = foods.length - 1; i >= 0; i--) {
      const f = foods[i];
      const dx = this.x - f.x;
      const dy = this.y - f.y;
      if (dx * dx + dy * dy < 64) {
        foods.splice(i, 1);
        this.energy += 20;
        break;
      }
    }

    this.energy -= 0.05;
    if (this.energy > 80) {
      this.energy /= 2;
      animals.push(new Animal(this.x + Math.random() * 10 - 5, this.y + Math.random() * 10 - 5));
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);
    ctx.fill();
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
  for (let i = animals.length - 1; i >= 0; i--) {
    const a = animals[i];
    a.update();
    if (a.energy <= 0) {
      animals.splice(i, 1);
    }
  }
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, width, height);

  for (const f of foods) {
    ctx.fillStyle = 'green';
    ctx.fillRect(f.x - 3, f.y - 3, 6, 6);
  }

  for (const a of animals) {
    a.draw();
  }
}

function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

const initial = 4 + Math.floor(Math.random() * 7);
for (let i = 0; i < initial; i++) {
  addAnimal(Math.random() * width, Math.random() * height);
}

loop();

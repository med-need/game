class Animal {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = Math.random() * 2 - 1;
    this.vy = Math.random() * 2 - 1;
    this.baseSpeed = 0.5 + Math.random() * 1.5;
    this.energy = 50;
    this.size = 5;
    this.color = `hsl(${Math.random() * 360},70%,60%)`;
    this.behavior = Math.random() < 0.5 ? 'nearest' : 'furthest';
    this.smart = Math.random() < 0.3;
    this.happy = 0;
    this.hunger = 0;
    this.evil = false;
    this.eatTimer = 0;
  }

  update() {
    this.happy = Math.max(0, this.happy - 1);
    let target = null;
    let best = this.behavior === 'nearest' ? Infinity : -Infinity;
    if (!this.evil) {
      for (const f of foods) {
        const dx = f.x - this.x;
        const dy = f.y - this.y;
        const d = dx * dx + dy * dy;
        if (this.behavior === 'nearest') {
          if (d < best) {
            best = d;
            target = f;
          }
        } else {
          if (d > best) {
            best = d;
            target = f;
          }
        }
      }
    } else {
      for (const a of animals) {
        if (a === this) continue;
        const d = (a.x - this.x) ** 2 + (a.y - this.y) ** 2;
        if (d < best) {
          best = d;
          target = a;
        }
      }
    }

    if (!this.evil && target && this.smart) {
      for (const a of animals) {
        if (a === this) continue;
        const ad = (a.x - target.x) ** 2 + (a.y - target.y) ** 2;
        if (ad < best) {
          target = null;
          break;
        }
      }
    }

    if (target) {
      const dx = target.x - this.x;
      const dy = target.y - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.vx += (dx / dist) * 0.1;
      this.vy += (dy / dist) * 0.1;
    } else {
      this.vx += Math.random() * 0.2 - 0.1;
      this.vy += Math.random() * 0.2 - 0.1;
    }

    const max = this.baseSpeed * (5 / this.size);
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > max) {
      this.vx *= max / speed;
      this.vy *= max / speed;
    }

    this.x += this.vx;
    this.y += this.vy;

    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
    this.x = Math.max(0, Math.min(width, this.x));
    this.y = Math.max(0, Math.min(height, this.y));

    let eating = false;
    for (let i = foods.length - 1; i >= 0; i--) {
      const f = foods[i];
      const dx = this.x - f.x;
      const dy = this.y - f.y;
      if (dx * dx + dy * dy < (this.size * 2) ** 2) {
        this.eatTimer++;
        if (this.eatTimer > 15 && (this.energy < 60 || Math.random() < 0.6)) {
          foods.splice(i, 1);
          this.energy += 20;
          this.size = Math.min(this.size + 0.5, 10);
          this.happy = 80;
          this.eatTimer = 0;
        }
        eating = true;
        break;
      }
    }
    if (!eating) this.eatTimer = 0;

    if (this.evil) {
      for (let i = animals.length - 1; i >= 0; i--) {
        const a = animals[i];
        if (a === this) continue;
        const dx = this.x - a.x;
        const dy = this.y - a.y;
        if (dx * dx + dy * dy < (this.size + a.size) ** 2) {
          animals.splice(i, 1);
          bloods.push({ x: a.x, y: a.y, life: 60 });
          this.energy += 30;
          this.size = Math.min(this.size + 0.7, 12);
          break;
        }
      }
    }

    this.energy -= 0.005;
    if (this.energy < 0) this.energy = 0;
    this.hunger = this.energy < 10 ? this.hunger + 1 : 0;
    if (!this.evil && this.hunger > 1000) {
      this.evil = true;
    }
    if (this.energy > 80) {
      this.energy /= 2;
      animals.push(new Animal(
        this.x + Math.random() * 20 - 10,
        this.y + Math.random() * 20 - 10
      ));
    }
  }

  draw() {
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    const eyeOffset = this.size * 0.4;
    const eyeSize = this.size * 0.2;
    ctx.fillStyle = this.evil ? '#f00' : '#fff';
    ctx.beginPath();
    ctx.arc(this.x - eyeOffset, this.y - eyeOffset, eyeSize, 0, Math.PI * 2);
    ctx.arc(this.x + eyeOffset, this.y - eyeOffset, eyeSize, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = this.evil ? '#900' : '#000';
    ctx.beginPath();
    ctx.arc(this.x - eyeOffset, this.y - eyeOffset, eyeSize / 2, 0, Math.PI * 2);
    ctx.arc(this.x + eyeOffset, this.y - eyeOffset, eyeSize / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (this.happy > 0) {
      ctx.arc(this.x, this.y + this.size * 0.2, this.size * 0.5, 0, Math.PI);
    } else {
      ctx.moveTo(this.x - this.size * 0.4, this.y + this.size * 0.3);
      ctx.lineTo(this.x + this.size * 0.4, this.y + this.size * 0.3);
    }
    ctx.stroke();
  }
}

class Food {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
}

class Monster {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.strength = 100;
    this.size = 12;
    this.baseSpeed = 1;
    this.rest = 0;
  }

  update() {
    if (this.rest > 0) {
      this.rest--;
      return;
    }
    let flee = false;
    let nearSavior = null;
    let savDist = Infinity;
    for (const s of saviors) {
      const d = (s.x - this.x) ** 2 + (s.y - this.y) ** 2;
      if (d < savDist) {
        savDist = d;
        nearSavior = s;
      }
    }
    if (nearSavior && nearSavior.strength > this.strength) {
      flee = true;
    }
    if (animals.length === 0 && !flee) return;
    let dx = 0;
    let dy = 0;
    if (flee && nearSavior) {
      dx = this.x - nearSavior.x;
      dy = this.y - nearSavior.y;
    } else {
      let target = animals[0];
      let best = (target.x - this.x) ** 2 + (target.y - this.y) ** 2;
      for (let i = 1; i < animals.length; i++) {
        const a = animals[i];
        const d = (a.x - this.x) ** 2 + (a.y - this.y) ** 2;
        if (d < best) {
          best = d;
          target = a;
        }
      }
      dx = target.x - this.x;
      dy = target.y - this.y;
    }
    const dist = Math.hypot(dx, dy) || 1;
    this.vx += (dx / dist) * 0.2;
    this.vy += (dy / dist) * 0.2;

    if (Math.random() < 0.01) {
      this.vx += (Math.random() * 2 - 1) * 2;
      this.vy += (Math.random() * 2 - 1) * 2;
    }

    const max = this.baseSpeed * 3;
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > max) {
      this.vx *= max / speed;
      this.vy *= max / speed;
    }

    this.x += this.vx;
    this.y += this.vy;
    if (this.x < 0 || this.x > width) this.vx *= -1;
    if (this.y < 0 || this.y > height) this.vy *= -1;
    this.x = Math.max(0, Math.min(width, this.x));
    this.y = Math.max(0, Math.min(height, this.y));

    for (let i = animals.length - 1; i >= 0; i--) {
      const a = animals[i];
      const dx2 = this.x - a.x;
      const dy2 = this.y - a.y;
      if (dx2 * dx2 + dy2 * dy2 < (this.size + a.size) ** 2) {
        animals.splice(i, 1);
        bloods.push({ x: a.x, y: a.y, life: 60 });
        this.strength = Math.min(this.strength + 10, 200);
        this.size = 12 * Math.sqrt(this.strength / 100);
        this.rest = 120;
        break;
      }
    }

    for (let i = saviors.length - 1; i >= 0; i--) {
      const s = saviors[i];
      const dxs = this.x - s.x;
      const dys = this.y - s.y;
      if (dxs * dxs + dys * dys < (this.size + s.size) ** 2) {
        const dmg = 20 + Math.random() * 30;
        this.strength -= dmg;
        s.strength -= dmg;
        if (this.strength <= 0) {
          monsters.splice(monsters.indexOf(this), 1);
          bloods.push({ x: this.x, y: this.y, life: 60 });
          break;
        }
        if (s.strength <= 0) {
          if (s.home) s.home.occupied = false;
          saviors.splice(i, 1);
          bloods.push({ x: s.x, y: s.y, life: 60 });
          this.strength = Math.min(this.strength + 20, 200);
          this.size = 12 * Math.sqrt(this.strength / 100);
          break;
        }
        break;
      }
    }
  }

  draw() {
    ctx.fillStyle = 'red';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
    ctx.arc(this.x + this.size * 0.3, this.y - this.size * 0.3, this.size * 0.2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = 'white';
    ctx.beginPath();
    const left = this.x - this.size * 0.3;
    const right = this.x + this.size * 0.3;
    const top = this.y + this.size * 0.1;
    const bottom = this.y + this.size * 0.4;
    ctx.moveTo(left, top);
    ctx.lineTo(left + this.size * 0.1, bottom);
    ctx.lineTo(left + this.size * 0.2, top);
    ctx.lineTo(left + this.size * 0.3, bottom);
    ctx.lineTo(left + this.size * 0.4, top);
    ctx.lineTo(right - this.size * 0.4, top);
    ctx.lineTo(right - this.size * 0.3, bottom);
    ctx.lineTo(right - this.size * 0.2, top);
    ctx.lineTo(right - this.size * 0.1, bottom);
    ctx.lineTo(right, top);
    ctx.fill();
  }
}

class Savior {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.strength = 120;
    this.size = 14;
    this.home = null;
  }

  update() {
    let enemy = null;
    let bestE = Infinity;
    for (const m of monsters) {
      const d = (m.x - this.x) ** 2 + (m.y - this.y) ** 2;
      if (d < bestE) { bestE = d; enemy = m; }
    }
    if (!enemy) {
      for (const a of animals) {
        if (!a.evil) continue;
        const d = (a.x - this.x) ** 2 + (a.y - this.y) ** 2;
        if (d < bestE) { bestE = d; enemy = a; }
      }
    }

    if (enemy) {
      if (this.home) this.home.occupied = false;
      this.home = null;
      const dx = enemy.x - this.x;
      const dy = enemy.y - this.y;
      const dist = Math.hypot(dx, dy) || 1;
      this.vx += (dx / dist) * 0.3;
      this.vy += (dy / dist) * 0.3;
    } else {
      if (!this.home && homes.length) {
        let bestH = Infinity;
        for (const h of homes) {
          const d = (h.x - this.x) ** 2 + (h.y - this.y) ** 2;
          if (d < bestH) { bestH = d; this.home = h; }
        }
      }
      if (this.home) {
        const dx = this.home.x - this.x;
        const dy = this.home.y - this.y;
        const dist = Math.hypot(dx, dy) || 1;
        if (dist > this.size + 10) {
          this.vx += (dx / dist) * 0.2;
          this.vy += (dy / dist) * 0.2;
        } else {
          this.home.occupied = true;
          this.vx *= 0.8;
          this.vy *= 0.8;
          if (Math.random() < 0.02) {
            this.vx += Math.random() * 0.4 - 0.2;
            this.vy += Math.random() * 0.4 - 0.2;
          }
        }
      } else if (Math.random() < 0.05) {
        this.vx += Math.random() * 0.4 - 0.2;
        this.vy += Math.random() * 0.4 - 0.2;
      }
    }

    const max = 2;
    const speed = Math.hypot(this.vx, this.vy);
    if (speed > max) {
      this.vx *= max / speed;
      this.vy *= max / speed;
    }

    this.x += this.vx;
    this.y += this.vy;
    this.x = Math.max(0, Math.min(width, this.x));
    this.y = Math.max(0, Math.min(height, this.y));

    for (let i = monsters.length - 1; i >= 0; i--) {
      const m = monsters[i];
      const dx = this.x - m.x;
      const dy = this.y - m.y;
      if (dx * dx + dy * dy < (this.size + m.size) ** 2) {
        const dmg = 20 + Math.random() * 30;
        this.strength -= dmg;
        m.strength -= dmg;
        if (m.strength <= 0) {
          monsters.splice(i, 1);
          bloods.push({ x: m.x, y: m.y, life: 60 });
          this.strength = Math.min(this.strength + 10, 220);
        }
        if (this.strength <= 0) {
          if (this.home) this.home.occupied = false;
          saviors.splice(saviors.indexOf(this), 1);
          bloods.push({ x: this.x, y: this.y, life: 60 });
          return;
        }
        break;
      }
    }

    for (let i = animals.length - 1; i >= 0; i--) {
      const a = animals[i];
      if (!a.evil) continue;
      const dx = this.x - a.x;
      const dy = this.y - a.y;
      if (dx * dx + dy * dy < (this.size + a.size) ** 2) {
        const dmg = 20 + Math.random() * 30;
        this.strength -= dmg;
        a.energy -= dmg;
        if (a.energy <= 0) {
          animals.splice(i, 1);
          bloods.push({ x: a.x, y: a.y, life: 60 });
          this.strength = Math.min(this.strength + 10, 220);
        }
        if (this.strength <= 0) {
          if (this.home) this.home.occupied = false;
          saviors.splice(saviors.indexOf(this), 1);
          bloods.push({ x: this.x, y: this.y, life: 60 });
          return;
        }
        break;
      }
    }

    for (let i = foods.length - 1; i >= 0; i--) {
      const f = foods[i];
      const dx = this.x - f.x;
      const dy = this.y - f.y;
      if (dx * dx + dy * dy < (this.size * 2) ** 2) {
        foods.splice(i, 1);
        this.strength = Math.min(this.strength + 5, 220);
      }
    }

    this.size = Math.min(14 * Math.sqrt(this.strength / 110), 25);
  }

  draw() {
    ctx.fillStyle = 'white';
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#444';
    ctx.fillRect(this.x - this.size * 0.5, this.y - this.size * 0.9, this.size, this.size * 0.3);
    ctx.fillStyle = '#000';
    ctx.beginPath();
    ctx.arc(this.x - this.size * 0.3, this.y - this.size * 0.2, this.size * 0.2, 0, Math.PI * 2);
    ctx.arc(this.x + this.size * 0.3, this.y - this.size * 0.2, this.size * 0.2, 0, Math.PI * 2);
    ctx.fill();
  }
}

class Home {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.spawn = 30;
    this.occupied = false;
    this.foodTimer = 300;
    this.animalTimer = 600;
  }

  update() {
    if (this.spawn > 0) this.spawn--;
    if (!this.occupied) return;
    this.foodTimer--;
    this.animalTimer--;
    if (this.foodTimer <= 0) {
      addFood(this.x + Math.random() * 20 - 10, this.y + Math.random() * 20 - 10);
      this.foodTimer = 300;
    }
    if (this.animalTimer <= 0) {
      addAnimal(this.x + Math.random() * 20 - 10, this.y + Math.random() * 20 - 10);
      this.animalTimer = 600;
    }
  }

  draw() {
    const scale = 1 + this.spawn / 30;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.scale(scale, scale);
    ctx.fillStyle = '#663300';
    ctx.fillRect(-10, -10, 20, 20);
    ctx.restore();
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
const monsters = [];
const saviors = [];
const homes = [];
const bloods = [];

function addAnimal(x, y) {
  animals.push(new Animal(x, y));
}

function addFood(x, y) {
  foods.push(new Food(x, y));
}

function spawnMonster() {
  monsters.push(new Monster(Math.random() * width, Math.random() * height));
}

function spawnSavior() {
  saviors.push(new Savior(Math.random() * width, Math.random() * height));
}

function randomFood() {
  const count = 25 + Math.floor(Math.random() * 26);
  for (let i = 0; i < count; i++) {
    addFood(Math.random() * width, Math.random() * height);
  }
}

canvas.addEventListener('click', (e) => {
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  addFood(x, y);
});

document.getElementById('spawn-monster').addEventListener('click', spawnMonster);
document.getElementById('spawn-savior').addEventListener('click', spawnSavior);
document.getElementById('random-food').addEventListener('click', randomFood);

function resolveCollisions() {
  for (let i = 0; i < animals.length; i++) {
    const a = animals[i];
    for (let j = i + 1; j < animals.length; j++) {
      const b = animals[j];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const dist = Math.hypot(dx, dy) || 1;
      const min = a.size + b.size;
      if (dist < min) {
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = min - dist;
        const total = a.size + b.size;
        a.x -= nx * overlap * (b.size / total);
        a.y -= ny * overlap * (b.size / total);
        b.x += nx * overlap * (a.size / total);
        b.y += ny * overlap * (a.size / total);

        const rvx = a.vx - b.vx;
        const rvy = a.vy - b.vy;
        const relVel = rvx * nx + rvy * ny;
        if (relVel < 0) {
          const impulse = (2 * relVel) / total * 1.2;
          a.vx -= impulse * b.size * nx;
          a.vy -= impulse * b.size * ny;
          b.vx += impulse * a.size * nx;
          b.vy += impulse * a.size * ny;
        }
      }
    }
  }
}

function checkHomes() {
  for (let i = 0; i < animals.length; i++) {
    const a = animals[i];
    if (a.evil) continue;
    const group = [a];
    for (let j = i + 1; j < animals.length; j++) {
      const b = animals[j];
      if (b.evil) continue;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (dist < 30) group.push(b);
    }
    if (group.length > 40) {
      const cx = group.reduce((s, p) => s + p.x, 0) / group.length;
      const cy = group.reduce((s, p) => s + p.y, 0) / group.length;
      for (const g of group) {
        const idx = animals.indexOf(g);
        if (idx >= 0) animals.splice(idx, 1);
      }
      homes.push(new Home(cx, cy));
      break;
    }
  }
}

function update() {
  for (let i = animals.length - 1; i >= 0; i--) {
    animals[i].update();
  }
  for (const m of monsters) m.update();
  for (const s of saviors) s.update();
  for (const h of homes) h.update();
  resolveCollisions();

  for (let i = bloods.length - 1; i >= 0; i--) {
    bloods[i].life--;
    if (bloods[i].life <= 0) bloods.splice(i, 1);
  }

  checkHomes();
}

function draw() {
  ctx.fillStyle = '#111';
  ctx.fillRect(0, 0, width, height);

  for (const f of foods) {
    ctx.fillStyle = 'green';
    ctx.fillRect(f.x - 3, f.y - 3, 6, 6);
  }

  for (const a of animals) a.draw();
  for (const h of homes) h.draw();
  for (const m of monsters) m.draw();
  for (const s of saviors) s.draw();

  for (const b of bloods) {
    ctx.fillStyle = `rgba(255,0,0,${b.life / 60})`;
    ctx.beginPath();
    ctx.arc(b.x, b.y, 8, 0, Math.PI * 2);
    ctx.fill();
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

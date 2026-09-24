const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

ctx.imageSmoothingEnabled = false;

const keys = {};

document.addEventListener("keydown", e => {
  keys[e.key.toLowerCase()] = true;

  if (e.code === "Space") {
    attack();
  }

  if (e.key.toLowerCase() === "e") {
    burst();
  }

  if (e.key.toLowerCase() === "r" && player.hp <= 0) {
    location.reload();
  }
});

document.addEventListener("keyup", e => {
  keys[e.key.toLowerCase()] = false;
});

const player = {
  x: 480,
  y: 270,
  size: 24,
  speed: 3,
  hp: 100,
  maxHp: 100,
  energy: 100,
  level: 1,
  xp: 0,
  coins: 0,
  attackCooldown: 0,
  color: "#7edcff"
};

const enemies = [];
const particles = [];
const gems = [];

for (let i = 0; i < 8; i++) {
  spawnEnemy();
}

function spawnEnemy() {
  enemies.push({
    x: Math.random() * 880 + 40,
    y: Math.random() * 460 + 40,
    size: 22,
    hp: 40,
    maxHp: 40,
    speed: 0.65 + Math.random() * 0.35,
    hitCooldown: 0,
    color: "#b957d8"
  });
}

function drawBackground() {
  ctx.fillStyle = "#1d503c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  for (let x = 0; x < canvas.width; x += 32) {
    for (let y = 0; y < canvas.height; y += 32) {
      ctx.fillStyle =
        (x / 32 + y / 32) % 2 === 0
          ? "#225b42"
          : "#20543e";

      ctx.fillRect(x, y, 32, 32);
    }
  }

  for (let i = 0; i < 25; i++) {
    const x = (i * 137) % canvas.width;
    const y = (i * 83) % canvas.height;

    ctx.fillStyle = "#183e31";
    ctx.fillRect(x, y, 8, 8);
    ctx.fillRect(x - 5, y + 5, 18, 7);
  }

  drawTree(90, 90);
  drawTree(850, 100);
  drawTree(100, 440);
  drawTree(850, 430);
}

function drawTree(x, y) {
  ctx.fillStyle = "#5b3929";
  ctx.fillRect(x - 6, y + 12, 12, 30);

  ctx.fillStyle = "#143d2c";
  ctx.fillRect(x - 24, y - 5, 48, 28);
  ctx.fillRect(x - 15, y - 18, 30, 42);

  ctx.fillStyle = "#26704a";
  ctx.fillRect(x - 18, y - 12, 36, 25);
}

function drawPlayer() {
  ctx.fillStyle = "#111";
  ctx.fillRect(player.x - 12, player.y - 9, 24, 26);

  ctx.fillStyle = player.color;
  ctx.fillRect(player.x - 9, player.y - 13, 18, 22);

  ctx.fillStyle = "#ffe0b5";
  ctx.fillRect(player.x - 7, player.y - 9, 14, 10);

  ctx.fillStyle = "#25224d";
  ctx.fillRect(player.x - 12, player.y - 16, 24, 7);

  ctx.fillStyle = "#f3c85b";
  ctx.fillRect(player.x - 11, player.y - 19, 22, 4);

  ctx.fillStyle = "#fff";
  ctx.fillRect(player.x + 3, player.y - 6, 3, 3);
}

function drawEnemy(enemy) {
  ctx.fillStyle = "#151020";
  ctx.fillRect(
    enemy.x - enemy.size / 2,
    enemy.y - enemy.size / 2,
    enemy.size,
    enemy.size
  );

  ctx.fillStyle = enemy.color;
  ctx.fillRect(
    enemy.x - 8,
    enemy.y - 8,
    16,
    17
  );

  ctx.fillStyle = "#ffdf6b";
  ctx.fillRect(enemy.x - 6, enemy.y - 5, 4, 4);
  ctx.fillRect(enemy.x + 3, enemy.y - 5, 4, 4);

  ctx.fillStyle = "#331638";
  ctx.fillRect(enemy.x - 10, enemy.y - 15, 7, 8);
  ctx.fillRect(enemy.x + 3, enemy.y - 15, 7, 8);

  const hpWidth = 30;

  ctx.fillStyle = "#222";
  ctx.fillRect(enemy.x - 15, enemy.y - 25, hpWidth, 4);

  ctx.fillStyle = "#ff5266";
  ctx.fillRect(
    enemy.x - 15,
    enemy.y - 25,
    hpWidth * (enemy.hp / enemy.maxHp),
    4
  );
}

function movePlayer() {
  let dx = 0;
  let dy = 0;

  if (keys["w"] || keys["arrowup"]) dy--;
  if (keys["s"] || keys["arrowdown"]) dy++;
  if (keys["a"] || keys["arrowleft"]) dx--;
  if (keys["d"] || keys["arrowright"]) dx++;

  if (dx !== 0 || dy !== 0) {
    const length = Math.sqrt(dx * dx + dy * dy);
    dx /= length;
    dy /= length;

    player.x += dx * player.speed;
    player.y += dy * player.speed;
  }

  player.x = Math.max(18, Math.min(canvas.width - 18, player.x));
  player.y = Math.max(25, Math.min(canvas.height - 20, player.y));
}

function attack() {
  if (player.attackCooldown > 0 || player.hp <= 0) return;

  player.attackCooldown = 18;

  createParticles(player.x, player.y, "#fff2a8", 8);

  enemies.forEach(enemy => {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 65) {
      enemy.hp -= 25;
      createParticles(enemy.x, enemy.y, "#ffcf4d", 12);

      if (enemy.hp <= 0) {
        killEnemy(enemy);
      }
    }
  });
}

function burst() {
  if (player.energy < 40 || player.hp <= 0) return;

  player.energy -= 40;

  createParticles(player.x, player.y, "#55d9ff", 80);

  enemies.forEach(enemy => {
    const dx = enemy.x - player.x;
    const dy = enemy.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 150) {
      enemy.hp -= 60;

      if (enemy.hp <= 0) {
        killEnemy(enemy);
      }
    }
  });
}

function killEnemy(enemy) {
  enemy.hp = 0;

  player.xp += 25;
  player.coins += 5;

  gems.push({
    x: enemy.x,
    y: enemy.y,
    life: 300
  });

  createParticles(enemy.x, enemy.y, "#d86cff", 25);

  setTimeout(() => {
    enemy.x = Math.random() * 880 + 40;
    enemy.y = Math.random() * 460 + 40;
    enemy.hp = enemy.maxHp;
  }, 500);
}

function moveEnemies() {
  enemies.forEach(enemy => {
    if (enemy.hp <= 0) return;

    const dx = player.x - enemy.x;
    const dy = player.y - enemy.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 30) {
      enemy.x += (dx / distance) * enemy.speed;
      enemy.y += (dy / distance) * enemy.speed;
    }

    if (distance < 30 && enemy.hitCooldown <= 0) {
      player.hp -= 8;
      enemy.hitCooldown = 60;

      createParticles(player.x, player.y, "#ff5266", 10);
    }

    if (enemy.hitCooldown > 0) {
      enemy.hitCooldown--;
    }
  });
}

function collectGems() {
  for (let i = gems.length - 1; i >= 0; i--) {
    const gem = gems[i];

    const dx = gem.x - player.x;
    const dy = gem.y - player.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 35) {
      player.energy = Math.min(100, player.energy + 15);
      gems.splice(i, 1);
    } else {
      gem.life--;

      if (gem.life <= 0) {
        gems.splice(i, 1);
      }
    }
  }
}

function updateParticles() {
  for (let i = particles.length - 1; i >= 0; i--) {
    const p = particles[i];

    p.x += p.vx;
    p.y += p.vy;
    p.life--;

    if (p.life <= 0) {
      particles.splice(i, 1);
    }
  }
}

function createParticles(x, y, color, amount) {
  for (let i = 0; i < amount; i++) {
    particles.push({
      x,
      y,
      vx: (Math.random() - .5) * 5,
      vy: (Math.random() - .5) * 5,
      life: 20 + Math.random() * 20,
      color
    });
  }
}

function drawParticles() {
  particles.forEach(p => {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, 5, 5);
  });
}

function drawGems() {
  gems.forEach(gem => {
    ctx.fillStyle = "#62e8ff";

    ctx.beginPath();
    ctx.moveTo(gem.x, gem.y - 7);
    ctx.lineTo(gem.x + 6, gem.y);
    ctx.lineTo(gem.x, gem.y + 8);
    ctx.lineTo(gem.x - 6, gem.y);
    ctx.closePath();
    ctx.fill();
  });
}

function levelUp() {
  if (player.xp >= 100) {
    player.xp -= 100;
    player.level++;

    player.maxHp += 15;
    player.hp = player.maxHp;

    player.speed += .15;

    createParticles(player.x, player.y, "#ffe45c", 50);
  }
}

function updateHUD() {
  document.getElementById("hp").style.width =
    Math.max(0, player.hp / player.maxHp * 100) + "%";

  document.getElementById("energy").style.width =
    player.energy + "%";

  document.getElementById("level").textContent =
    player.level;

  document.getElementById("xp").textContent =
    player.xp;

  document.getElementById("coins").textContent =
    player.coins;
}

function gameLoop() {
  drawBackground();

  if (player.hp > 0) {
    movePlayer();
    moveEnemies();
    collectGems();

    if (player.attackCooldown > 0) {
      player.attackCooldown--;
    }

    player.energy = Math.min(100, player.energy + .025);

    levelUp();
  }

  updateParticles();

  drawGems();

  enemies.forEach(drawEnemy);

  drawPlayer();
  drawParticles();

  updateHUD();

  if (player.hp <= 0) {
    document.getElementById("gameOver").style.display = "flex";
  }

  requestAnimationFrame(gameLoop);
}

gameLoop();

                       made by Nightmare_DevX 

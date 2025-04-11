// js/main.js
import Player from './player.js';

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas full screen
function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Input handling
const keys = {};
document.addEventListener('keydown', e => {
    keys[e.code] = true
    console.log(keys)
    });
document.addEventListener('keyup', e => keys[e.code] = false);


// Create player
const player = new Player(400, 300,'../assets/sprites/character.png');

// Main game loop
function gameLoop() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
    
  player.update(keys, canvas.height);
  player.draw(ctx);

  requestAnimationFrame(gameLoop);
}

gameLoop()
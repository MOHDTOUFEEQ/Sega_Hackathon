import Player from '../classes/Player.js';
import Sprite from '../classes/Sprite.js';
import Heart from '../classes/Heart.js';
import Eagle from '../classes/Eagle.js';
import Oposum from '../classes/Oposum.js';
import CollisionBlock from '../classes/CollisionBlock.js';
import Platform from '../classes/Platform.js';
import gameState from '../classes/ui.js';
import { loadImage, checkCollisions } from './utils.js';
import collisions from '../data/collisions.js';
import l_Gems from '../data/l_Gems.js';
import l_New_Layer_1 from '../data/l_New_Layer_1.js';
import l_New_Layer_2 from '../data/l_New_Layer_2.js';
import l_New_Layer_8 from '../data/l_New_Layer_8.js';
import l_Back_Tiles from '../data/l_Back_Tiles.js';
import l_Decorations from '../data/l_Decorations.js';
import l_Front_Tiles from '../data/l_Front_Tiles.js';
import l_Shrooms from '../data/l_Shrooms.js';
import l_Collisions from '../data/l_Collisions.js';
import l_Grass from '../data/l_Grass.js';
import l_Trees from '../data/l_Trees.js';
import Enemy from '../classes/Enemy.js';
import BigMonster from '../classes/BigMonster.js';
import { store } from '../../../store/store.js';
import { collectGem, setMonsterKilled, setPlayerDead } from '../../../store/playerSlice.js';

// Initialize variables
let canvas;
let c;
const dpr = 2;
let isFiring = false;

// Function to initialize canvas
function initializeCanvas() {
	try {
		// Use the global canvas reference
		canvas = window.gameCanvas;
		if (!canvas) {
			console.error('Canvas element not found');
			return false;
		}
		
		c = canvas.getContext('2d');
		if (!c) {
			console.error('Could not get canvas context');
			return false;
		}

		// Set canvas dimensions
		canvas.width = 1024 * dpr;
		canvas.height = 576 * dpr;

		return true;
	} catch (error) {
		console.error('Error initializing canvas:', error);
		return false;
	}
}

const oceanLayerData = {
	l_New_Layer_1: l_New_Layer_1,
};

const brambleLayerData = {
	l_New_Layer_2: l_New_Layer_2,
};

const layersData = {
	l_New_Layer_8: l_New_Layer_8,
	l_Back_Tiles: l_Back_Tiles,
	l_Decorations: l_Decorations,
	l_Front_Tiles: l_Front_Tiles,
	l_Shrooms: l_Shrooms,
	l_Collisions: l_Collisions,
	l_Grass: l_Grass,
	l_Trees: l_Trees,
};

const tilesets = {
	l_New_Layer_1: { imageUrl: "/src/components/game/images/decorations1.png", tileSize: 16 },
	l_New_Layer_2: { imageUrl: "/src/components/game/images/decorations1.png", tileSize: 16 },
	l_New_Layer_8: { imageUrl: "/src/components/game/images/tileset1.png", tileSize: 16 },
	l_Back_Tiles: { imageUrl: "/src/components/game/images/tileset1.png", tileSize: 16 },
	l_Decorations: { imageUrl: "/src/components/game/images/decorations1.png", tileSize: 16 },
	l_Front_Tiles: { imageUrl: "/src/components/game/images/tileset1.png", tileSize: 16 },
	l_Shrooms: { imageUrl: "/src/components/game/images/decorations1.png", tileSize: 16 },
	l_Collisions: { imageUrl: "/src/components/game/images/decorations1.png", tileSize: 16 },
	l_Grass: { imageUrl: "/src/components/game/images/tileset1.png", tileSize: 16 },
	l_Trees: { imageUrl: "/src/components/game/images/decorations1.png", tileSize: 16 },
};

// Tile setup
const collisionBlocks = [];
const platforms = [];
const blockSize = 16;

collisions.forEach((row, y) => {
	row.forEach((symbol, x) => {
		if (symbol === 1) {
			collisionBlocks.push(
				new CollisionBlock({
					x: x * blockSize,
					y: y * blockSize,
					size: blockSize,
				})
			);
		} else if (symbol === 2) {
			platforms.push(
				new Platform({
					x: x * blockSize,
					y: y * blockSize + blockSize,
					width: 16,
					height: 4,
				})
			);
		}
	});
});

const renderLayer = (tilesData, tilesetImage, tileSize, context) => {
	tilesData.forEach((row, y) => {
		row.forEach((symbol, x) => {
			if (symbol !== 0) {
				const srcX = ((symbol - 1) % (tilesetImage.width / tileSize)) * tileSize;
				const srcY = Math.floor((symbol - 1) / (tilesetImage.width / tileSize)) * tileSize;

				context.drawImage(
					tilesetImage, // source image
					srcX,
					srcY, // source x, y
					tileSize,
					tileSize, // source width, height
					x * 16,
					y * 16, // destination x, y
					16,
					16 // destination width, height
				);
			}
		});
	});
};

const renderStaticLayers = async (layersData) => {
	const offscreenCanvas = document.createElement("canvas");
	offscreenCanvas.width = canvas.width;
	offscreenCanvas.height = canvas.height;
	const offscreenContext = offscreenCanvas.getContext("2d");

	for (const [layerName, tilesData] of Object.entries(layersData)) {
		const tilesetInfo = tilesets[layerName];
		if (tilesetInfo) {
			try {
				const tilesetImage = await loadImage(tilesetInfo.imageUrl);
				if (!tilesetImage) {
					console.error(`Failed to load image for layer ${layerName}: Image is null`);
					continue;
				}
				renderLayer(tilesData, tilesetImage, tilesetInfo.tileSize, offscreenContext);
			} catch (error) {
				console.error(`Failed to load image for layer ${layerName}:`, error);
			}
		}
	}

	// Optionally draw collision blocks and platforms for debugging
	// collisionBlocks.forEach(block => block.draw(offscreenContext));
	// platforms.forEach((platform) => platform.draw(offscreenContext))

	return offscreenCanvas;
};
// END - Tile setup

// Game objects
let player;
let oposums = [];
let eagles = [];
let enemies = [];
let sprites = [];
// let hearts = [];
let gems = [];
let gemUI;
let gemCount = 0;
let bigMonster;

// Camera settings
let camera = {
	x: 0,
	y: 0,
};

const SCROLL_POST_RIGHT = 330;
const SCROLL_POST_TOP = 100;
const SCROLL_POST_BOTTOM = 270;
let oceanBackgroundCanvas = null;
let brambleBackgroundCanvas = null;

// Keyboard controls
const keys = {
	w: { pressed: false },
	a: { pressed: false },
	d: { pressed: false },
	ArrowLeft: { pressed: false },
	ArrowRight: { pressed: false },
	ArrowUp: { pressed: false },
	Space: { pressed: false },
	mouseLeft: { pressed: false } 
};

// Add event listeners for keyboard controls
window.addEventListener('keydown', (event) => {
	switch (event.key) {
		case 'w':
		case 'ArrowUp':
			keys.w.pressed = true;
			break;
		case 'a':
		case 'ArrowLeft':
			keys.a.pressed = true;
			break;
		case 'd':
		case 'ArrowRight':
			keys.d.pressed = true;
			break;
		case ' ':
			keys.Space.pressed = true;
			break;
	}
});

window.addEventListener('keyup', (event) => {
	switch (event.key) {
		case 'w':
		case 'ArrowUp':
			keys.w.pressed = false;
			break;
		case 'a':
		case 'ArrowLeft':
			keys.a.pressed = false;
			break;
		case 'd':
		case 'ArrowRight':
			keys.d.pressed = false;
			break;
		case ' ':
			keys.Space.pressed = false;
			break;
	}
});
window.addEventListener("mousedown", (e) => {
	if (e.button === 0) {
		player.fire();
	}
});

window.addEventListener("mouseup", (e) => {
	if (e.button === 0) {
	}
});

// Timing control
let lastTime = performance.now();
let accumulatedTime = 0;
const timeStep = 1/60; // 60 FPS
const MAX_DELTA_TIME = 0.1; // Maximum delta time in seconds

function resetGameTiming() {
	lastTime = performance.now();
	accumulatedTime = 0;
}

function init() {
	if (!initializeCanvas()) {
		console.error('Failed to initialize canvas');
		return;
	}

	gems = [];
	gemCount = 0;
	gemUI = new Sprite({
		x: 13,
		y: 36,
		width: 15,
		height: 13,
		imageSrc: "/src/components/game/images/gem.png",
		spriteCropbox: {
			x: 0,
			y: 0,
			width: 15,
			height: 13,
			frames: 5,
		},
	});

	l_Gems.forEach((row, y) => {
		row.forEach((symbol, x) => {
			if (symbol === 18) {
				gems.push(
					new Sprite({
						x: x * 16,
						y: y * 16,
						width: 15,
						height: 13,
						imageSrc: "/src/components/game/images/gem.png",
						spriteCropbox: {
							x: 0,
							y: 0,
							width: 15,
							height: 13,
							frames: 5,
						},
						hitbox: {
							x: x * 16,
							y: y * 16,
							width: 15,
							height: 13,
						},
					})
				);
			}
		});
	});

	player = new Player({
		x: 100,
		y: 100,
		size: 32,
		velocity: { x: 0, y: 0 },
		camera: camera
	});
	
	
	eagles = [
		new Eagle({
			x: 816,
			y: 172,
			width: 40,
			height: 41,
		}),
		new Eagle({
			x: 1116,
			y: 172,
			width: 40,
			height: 41,
		}),
		new Eagle({
			x: 1399,
			y: 100,
			width: 40,
			height: 41,
		}),
	];

	oposums = [
		new Oposum({
			x: 650,
			y: 100,
			width: 36,
			height: 28,
		}),
		new Oposum({
			x: 906,
			y: 515,
			width: 36,
			height: 28,
		}),
		new Oposum({
			x: 1150,
			y: 515,
			width: 36,
			height: 28,
		}),
		new Oposum({
			x: 1663,
			y: 200,
			width: 36,
			height: 28,
		}),
	];

	sprites = [];
	// hearts = [
	// 	new Heart({
	// 		x: 10,
	// 		y: 10,
	// 		width: 21,
	// 		height: 18,
	// 		imageSrc: "/src/components/game/images/hearts.png",
	// 		spriteCropbox: {
	// 			x: 0,
	// 			y: 0,
	// 			width: 21,
	// 			height: 18,
	// 			frames: 6,
	// 		},
	// 	}),
	// 	new Heart({
	// 		x: 33,
	// 		y: 10,
	// 		width: 21,
	// 		height: 18,
	// 		imageSrc: "/src/components/game/images/hearts.png",
	// 		spriteCropbox: {
	// 			x: 0,
	// 			y: 0,
	// 			width: 21,
	// 			height: 18,
	// 			frames: 6,
	// 		},
	// 	}),
	// 	new Heart({
	// 		x: 56,
	// 		y: 10,
	// 		width: 21,
	// 		height: 18,
	// 		imageSrc: "/src/components/game/images/hearts.png",
	// 		spriteCropbox: {
	// 			x: 0,
	// 			y: 0,
	// 			width: 21,
	// 			height: 18,
	// 			frames: 6,
	// 		},
	// 	}),
	// ];

	camera = {
		x: 0,
		y: 0,
	};

	// Create some enemies
	enemies = [
		new Enemy({
			x: 900,
			y: 495,
			width: 30,
			height: 30,
			imageSrc: "/src/components/game/images/enemy.png",
			canvasWidth: canvas.width,
		}),
		new Enemy({
			x: 1200,
			y: 495,
			width: 30,
			height: 35,
			imageSrc: "/src/components/game/images/enemy.png",
			canvasWidth: canvas.width,
		}),
		new Enemy({
			x: 300,
			y: 68,
			width: 30,
			height: 35,
			imageSrc: "/src/components/game/images/enemy.png",
			canvasWidth: canvas.width,
		}),
		new Enemy({
			x: 1100,
			y: 30,
			width: 30,
			height: 35,
			imageSrc: "/src/components/game/images/enemy.png",
			canvasWidth: canvas.width,
		}),
		new Enemy({
			x: 950,
			y: 250,
			width: 30,
			height: 30,
			imageSrc: "/src/components/game/images/enemy.png",
			canvasWidth: canvas.width,
		}),
	];

	// Initialize BigMonster
	bigMonster = new BigMonster({
		x: 1800,
		y: 100,
		imageSrc: "/src/components/game/images/big-monster.png"
	});
}

function animate(backgroundCanvas) {
	if (!canvas || !c) {
		console.error('Canvas not initialized');
		return;
	}

	// Calculate delta time and clamp it
	const currentTime = performance.now();
	let deltaTime = (currentTime - lastTime) / 1000;
	deltaTime = Math.min(deltaTime, MAX_DELTA_TIME);
	lastTime = currentTime;

	// Accumulate time for fixed time step updates
	accumulatedTime += deltaTime;

	// Update game state at fixed time steps
	while (accumulatedTime >= timeStep) {
		// Skip all updates if game is over
		if (!window.isGameOver) {
			// Update player position
			player.handleInput(keys);
			player.update(timeStep, collisionBlocks);
			if (isFiring) {
				player.fire();
			}

			player.bullets.forEach(bullet => bullet.update());
			
			// Check bullet collisions with obstacles and enemies
			for (let i = player.bullets.length - 1; i >= 0; i--) {
				const bullet = player.bullets[i];
				let bulletHit = false;
				
				// Check collision with collision blocks
				for (let j = 0; j < collisionBlocks.length; j++) {
					const block = collisionBlocks[j];
					if (bullet.x < block.x + block.width &&
						bullet.x + bullet.width > block.x &&
						bullet.y < block.y + block.height &&
						bullet.y + bullet.height > block.y) {
						bulletHit = true;
						break;
					}
				}
				
				// Check collision with oposums
				for (let j = oposums.length - 1; j >= 0; j--) {
					const oposum = oposums[j];
					
					if (bullet.x < oposum.x + oposum.width &&
						bullet.x + bullet.width > oposum.x &&
						bullet.y < oposum.y + oposum.height &&
						bullet.y + bullet.height > oposum.y) {
						oposum.health -= 20; // Reduce health by 10%
						if (oposum.health <= 0) {
							oposum.die();
							sprites.push(
								new Sprite({
									x: oposum.x,
									y: oposum.y,
									width: 32,
									height: 32,
									imageSrc: "/src/components/game/images/enemy-death.png",
									spriteCropbox: {
										x: 0,
										y: 0,
										width: 40,
										height: 41,
										frames: 6,
									},
								})
							);
							oposums.splice(j, 1);
						}
						bulletHit = true;
						break;
					}
				}
				
				// Check collision with eagles
				for (let j = eagles.length - 1; j >= 0; j--) {
					const eagle = eagles[j];
					if (bullet.x < eagle.x + eagle.width &&
						bullet.x + bullet.width > eagle.x &&
						bullet.y < eagle.y + eagle.height &&
						bullet.y + bullet.height > eagle.y) {
						eagle.health -= 20; // Reduce health by 10%
						if (eagle.health <= 0) {
							eagle.die();
							sprites.push(
								new Sprite({
									x: eagle.x,
									y: eagle.y,
									width: 32,
									height: 32,
									imageSrc: "/src/components/game/images/enemy-death.png",
									spriteCropbox: {
										x: 0,
										y: 0,
										width: 40,
										height: 41,
										frames: 6,
									},
								})
							);
							eagles.splice(j, 1);
						}
						bulletHit = true;
						break;
					}
				}
				
				if (bulletHit) {
					player.bullets.splice(i, 1);
				}
			}
			
			player.bullets = player.bullets.filter(bullet => bullet.x < canvas.width && bullet.x > 0);

			// Update oposum position
			for (let i = oposums.length - 1; i >= 0; i--) {
				const oposum = oposums[i];
				oposum.update(timeStep, collisionBlocks);

				// Jump on enemy
				const collisionDirection = checkCollisions(player, oposum);
				if (collisionDirection) {
					if (collisionDirection === "bottom" && !player.isOnGround) {
						player.velocity.y = -200;
						
						if (!oposum.isDead) {
							oposum.die();
							sprites.push(
								new Sprite({
									x: oposum.x,
									y: oposum.y,
									width: 32,
									height: 32,
									imageSrc: "/src/components/game/images/enemy-death.png",
									spriteCropbox: {
										x: 0,
										y: 0,
										width: 40,
										height: 41,
										frames: 6,
									},
								})
							);
							oposums.splice(i, 1);
						}
					} else if ((collisionDirection === "left" || collisionDirection === "right") && player.isOnGround && player.isRolling) {
						if (!oposum.isDead) {
							oposum.die();
							sprites.push(
								new Sprite({
									x: oposum.x,
									y: oposum.y,
									width: 32,
									height: 32,
									imageSrc: "/src/components/game/images/enemy-death.png",
									spriteCropbox: {
										x: 0,
										y: 0,
										width: 40,
										height: 41,
										frames: 6,
									},
								})
							);
							oposums.splice(i, 1);
						}
					} else if (collisionDirection === "left" || collisionDirection === "right") {
						player.health -= 10;
						if (!oposum.isDead) {
							oposum.die();
							sprites.push(
								new Sprite({
									x: oposum.x,
									y: oposum.y,
									width: 32,
									height: 32,
									imageSrc: "/src/components/game/images/enemy-death.png",
									spriteCropbox: {
										x: 0,
										y: 0,
										width: 40,
										height: 41,
										frames: 6,
									},
								})
							);
							oposums.splice(i, 1);
						}
						player.setIsInvincible();
					}
				}
			}

			// Update eagle position
			for (let i = eagles.length - 1; i >= 0; i--) {
				const eagle = eagles[i];
				eagle.update(timeStep, collisionBlocks);

				// Jump on enemy
				const collisionDirection = checkCollisions(player, eagle);
				if (collisionDirection) {
					if (collisionDirection === "bottom" && !player.isOnGround) {
						player.velocity.y = -200;
						if (!eagle.isDead) {
							eagle.die();
							sprites.push(
								new Sprite({
									x: eagle.x,
									y: eagle.y,
									width: 32,
									height: 32,
									imageSrc: "/src/components/game/images/enemy-death.png",
									spriteCropbox: {
										x: 0,
										y: 0,
										width: 40,
										height: 41,
										frames: 6,
									},
								})
							);
							eagles.splice(i, 1);
						}
					} else if (collisionDirection === "left" || collisionDirection === "right" || collisionDirection === "top") {
						player.health -= 10;
						if (!eagle.isDead) {
							eagle.die();
							sprites.push(
								new Sprite({
									x: eagle.x,
									y: eagle.y,
									width: 32,
									height: 32,
									imageSrc: "/src/components/game/images/enemy-death.png",
									spriteCropbox: {
										x: 0,
										y: 0,
										width: 40,
										height: 41,
										frames: 6,
									},
								})
							);
							eagles.splice(i, 1);
						}
						player.setIsInvincible();
					}
				}
			}

			// Update enemies
			for (let i = enemies.length - 1; i >= 0; i--) {
				const enemy = enemies[i];
				enemy.update(timeStep, collisionBlocks);
				
				// Check bullet collisions with player
				for (let j = enemy.bullets.length - 1; j >= 0; j--) {
					const bullet = enemy.bullets[j];
					
					// Check if bullet has traveled maximum distance
					if (Math.abs(bullet.x - bullet.initialX) >= 300) {
						enemy.bullets.splice(j, 1);
						continue;
					}
					
					// Check collision with barriers
					let bulletHit = false;
					for (let k = 0; k < collisionBlocks.length; k++) {
						const block = collisionBlocks[k];
						if (bullet.x < block.x + block.width &&
							bullet.x + bullet.width > block.x &&
							bullet.y < block.y + block.height &&
							bullet.y + bullet.height > block.y) {
							bulletHit = true;
							break;
						}
					}
					
					if (bulletHit) {
						enemy.bullets.splice(j, 1);
						continue;
					}
					
					if (bullet.x < player.x + player.width &&
						bullet.x + bullet.width > player.x &&
						bullet.y < player.y + player.height &&
						bullet.y + bullet.height > player.y) {
						player.health -= 10;
						enemy.bullets.splice(j, 1);
						player.setIsInvincible();
					}
				}
				if (player.health <= 0) {
					const gameOverScreen = document.getElementById('gameOverScreen');
					window.isGameOver = true;
					store.dispatch(setPlayerDead()); // Update Redux store directly
					store.dispatch(collectGem(gemCount)); // Update Redux store directly
					if (gameOverScreen) {
						gameOverScreen.classList.remove('hidden');
					}
				}

				// Check player collision with enemy
				const collisionDirection = checkCollisions(player, enemy);
				if (collisionDirection) {
					if (collisionDirection === "bottom" && !player.isOnGround) {
						player.velocity.y = -200;
						if (!enemy.isDead) {
							enemy.die();
							sprites.push(
								new Sprite({
									x: enemy.x,
									y: enemy.y,
									width: 32,
									height: 32,
									imageSrc: "/src/components/game/images/enemy-death.png",
									spriteCropbox: {
										x: 0,
										y: 0,
										width: 40,
										height: 41,
										frames: 6,
									},
								})
							);
							enemies.splice(i, 1);
						}
					} else if ((collisionDirection === "left" || collisionDirection === "right") && player.isOnGround && player.isRolling) {
						if (!enemy.isDead) {
							enemy.die();
							sprites.push(
								new Sprite({
									x: enemy.x,
									y: enemy.y,
									width: 32,
									height: 32,
									imageSrc: "/src/components/game/images/enemy-death.png",
									spriteCropbox: {
										x: 0,
										y: 0,
										width: 40,
										height: 41,
										frames: 6,
									},
								})
							);
							enemies.splice(i, 1);
						}
					} else if (collisionDirection === "left" || collisionDirection === "right") {
						player.health -= 10;
						if (!enemy.isDead) {
							enemy.die();
							sprites.push(
								new Sprite({
									x: enemy.x,
									y: enemy.y,
									width: 32,
									height: 32,
									imageSrc: "/src/components/game/images/enemy-death.png",
									spriteCropbox: {
										x: 0,
										y: 0,
										width: 40,
										height: 41,
										frames: 6,
									},
								})
							);
							enemies.splice(i, 1);
						}
						player.setIsInvincible();
					}
				}
				
				// Check bullet collisions with enemy
				for (let j = player.bullets.length - 1; j >= 0; j--) {
					const bullet = player.bullets[j];
					if (bullet.x < enemy.x + enemy.width &&
						bullet.x + bullet.width > enemy.x &&
						bullet.y < enemy.y + enemy.height &&
						bullet.y + bullet.height > enemy.y) {
						enemy.health -= 20;
						if (enemy.health <= 0 && !enemy.isDead) {
							enemy.die();
							sprites.push(
								new Sprite({
									x: enemy.x,
									y: enemy.y,
									width: 32,
									height: 32,
									imageSrc: "/src/components/game/images/enemy-death.png",
									spriteCropbox: {
										x: 0,
										y: 0,
										width: 40,
										height: 41,
										frames: 6,
									},
								})
							);
							enemies.splice(i, 1);
						}
						player.bullets.splice(j, 1);
						break;
					}
				}
			}

			for (let i = sprites.length - 1; i >= 0; i--) {
				const sprite = sprites[i];
				sprite.update(timeStep);

				if (sprite.iteration === 1) {
					sprites.splice(i, 1);
				}
			}

			for (let i = gems.length - 1; i >= 0; i--) {
				const gem = gems[i];
				gem.update(timeStep);

				// Collect gems
				const collisionDirection = checkCollisions(player, gem);
				if (collisionDirection) {
					// Create an item feedback animation
					sprites.push(
						new Sprite({
							x: gem.x - 8,
							y: gem.y - 8,
							width: 32,
							height: 32,
							imageSrc: "/src/components/game/images/item-feedback.png",
							spriteCropbox: {
								x: 0,
								y: 0,
								width: 32,
								height: 32,
								frames: 5,
							},
						})
					);

					// Remove a gem from the game
					gems.splice(i, 1);
					gemCount++;

				}
			}

			// Track scroll post distance
			if (player.x > SCROLL_POST_RIGHT && player.x < 1680) {
				const scrollPostDistance = player.x - SCROLL_POST_RIGHT;
				camera.x = scrollPostDistance;
			}

			if (player.y < SCROLL_POST_TOP && camera.y > 0) {
				const scrollPostDistance = SCROLL_POST_TOP - player.y;
				camera.y = scrollPostDistance;
			}
			if (player.y > SCROLL_POST_BOTTOM) {
				const scrollPostDistance = (player.y - SCROLL_POST_BOTTOM) * 0.75; // softer follow
				camera.y = -scrollPostDistance;
			}

			// Update BigMonster
			if (bigMonster) {
				bigMonster.update(timeStep);
			}

			// Check bullet collisions with BigMonster
			for (let i = player.bullets.length - 1; i >= 0; i--) {
				const bullet = player.bullets[i];
				if (bullet.x < bigMonster.x + bigMonster.width &&
					bullet.x + bullet.width > bigMonster.x &&
					bullet.y < bigMonster.y + bigMonster.height &&
					bullet.y + bullet.height > bigMonster.y) {
					bigMonster.health -= 5; // Reduce monster health by 5
					player.bullets.splice(i, 1); // Remove the bullet
					
					// Check if monster is dead
					if (bigMonster.health <= 0) {
						// Add death animation sprite
						sprites.push(
							new Sprite({
								x: bigMonster.x,
								y: bigMonster.y,
								width: 32,
								height: 32,
								imageSrc: "/src/components/game/images/enemy-death.png",
								spriteCropbox: {
									x: 0,
									y: 0,
									width: 40,
									height: 41,
									frames: 6,
								},
							})
						);
						// Remove the monster from the game
						bigMonster = null;
						// Show game over screen
						const gameOverScreen = document.getElementById('gameOverScreen');
						window.isGameOver = true;
						store.dispatch(setMonsterKilled()); // Update Redux store directly
						store.dispatch(collectGem(gemCount));
						if (gameOverScreen) {
							gameOverScreen.classList.remove('hidden');
						}
					}
					break;
				}
			}

			// Check BigMonster bullet collisions with player
			if (bigMonster) { // Only check if monster is still alive
				for (let i = bigMonster.bullets.length - 1; i >= 0; i--) {
					const bullet = bigMonster.bullets[i];
					if (bullet.x < player.x + player.width &&
						bullet.x + bullet.width > player.x &&
						bullet.y < player.y + player.height &&
						bullet.y + bullet.height > player.y) {
						player.health -= 5; // Reduce player health by 5
						bigMonster.bullets.splice(i, 1); // Remove the bullet
						player.setIsInvincible(); // Make player temporarily invincible
						break;
					}
				}
			}
		}

		accumulatedTime -= timeStep;
	}

	// Render scene
	c.save();
	c.scale(dpr + 1, dpr + 1);
	c.translate(-camera.x, camera.y);
	c.clearRect(0, 0, canvas.width, canvas.height);
	c.drawImage(oceanBackgroundCanvas, camera.x * 0.32, 0);
	c.drawImage(brambleBackgroundCanvas, camera.x * 0.16, 0);
	c.drawImage(backgroundCanvas, 0, 0);
	player.draw(c);

	// Draw bullets (already in screen coordinates)
	player.bullets.forEach(bullet => {
		bullet.draw(c);
	});

	for (let i = oposums.length - 1; i >= 0; i--) {
		const oposum = oposums[i];
		oposum.draw(c);
	}

	for (let i = eagles.length - 1; i >= 0; i--) {
		const eagle = eagles[i];
		eagle.draw(c);
	}
	
	// Draw enemies
	for (let i = enemies.length - 1; i >= 0; i--) {
		const enemy = enemies[i];
		enemy.draw(c);
	}
	
	for (let i = sprites.length - 1; i >= 0; i--) {
		const sprite = sprites[i];
		sprite.draw(c);
	}

	for (let i = gems.length - 1; i >= 0; i--) {
		const gem = gems[i];
		gem.draw(c);
	}

	// Draw BigMonster
	if (bigMonster) {
		bigMonster.draw(c);
	}

	c.restore();

	// UI save and restore
	c.save();
	const ui = new gameState();
	ui.updateHealthBar(player.health);
	c.scale(dpr + 1, dpr + 1);
	// for (let i = hearts.length - 1; i >= 0; i--) {
	// 	const heart = hearts[i];
	// 	heart.draw(c);
	// }

	gemUI.draw(c);
	c.fillStyle = 'purple';
	c.fillText(gemCount, 33, 46);
	c.restore();

	// Remove dead enemies after their death animation completes
	oposums = oposums.filter(oposum => {
		if (oposum.isDead) {
			oposum.deathAnimationTime += timeStep;
			return oposum.deathAnimationTime < oposum.deathAnimationDuration;
		}
		return true;
	});
	
	eagles = eagles.filter(eagle => {
		if (eagle.isDead) {
			eagle.deathAnimationTime += timeStep;
			return eagle.deathAnimationTime < eagle.deathAnimationDuration;
		}
		return true;
	});

	requestAnimationFrame(() => animate(backgroundCanvas));
}

async function startRendering() {
	try {
		if (!canvas || !c) {
			throw new Error('Canvas not initialized');
		}
		oceanBackgroundCanvas = await renderStaticLayers(oceanLayerData);
		brambleBackgroundCanvas = await renderStaticLayers(brambleLayerData);
		const backgroundCanvas = await renderStaticLayers(layersData);
		
		if (!backgroundCanvas) {
			throw new Error('Failed to create the background canvas');
		}
		
		animate(backgroundCanvas);
	} catch (error) {
		console.error('Error during rendering:', error);
	}
}

init();
startRendering();

export { init, startRendering, resetGameTiming };

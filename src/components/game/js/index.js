import Player from '../classes/Player.js';
import Sprite from '../classes/Sprite.js';
import Heart from '../classes/Heart.js';
import Eagle from '../classes/Eagle.js';
import Oposum from '../classes/Oposum.js';
import CollisionBlock from '../classes/CollisionBlock.js';
import Platform from '../classes/Platform.js';
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

// Initialize variables
let canvas;
let c;
const dpr = 2;

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
let sprites = [];
let hearts = [];
let gems = [];
let gemUI;
let gemCount = 0;

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
	Space: { pressed: false }
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
	});
	eagles = [
		new Eagle({
			x: 816,
			y: 172,
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
	hearts = [
		new Heart({
			x: 10,
			y: 10,
			width: 21,
			height: 18,
			imageSrc: "/src/components/game/images/hearts.png",
			spriteCropbox: {
				x: 0,
				y: 0,
				width: 21,
				height: 18,
				frames: 6,
			},
		}),
		new Heart({
			x: 33,
			y: 10,
			width: 21,
			height: 18,
			imageSrc: "/src/components/game/images/hearts.png",
			spriteCropbox: {
				x: 0,
				y: 0,
				width: 21,
				height: 18,
				frames: 6,
			},
		}),
		new Heart({
			x: 56,
			y: 10,
			width: 21,
			height: 18,
			imageSrc: "/src/components/game/images/hearts.png",
			spriteCropbox: {
				x: 0,
				y: 0,
				width: 21,
				height: 18,
				frames: 6,
			},
		}),
	];

	camera = {
		x: 0,
		y: 0,
	};
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
		// Update player position
		player.handleInput(keys);
		player.update(timeStep, collisionBlocks);

		// Update oposum position
		// for (let i = oposums.length - 1; i >= 0; i--) {
		// 	const oposum = oposums[i];
		// 	oposum.update(timeStep, collisionBlocks);

		// 	// Jump on enemy
		// 	const collisionDirection = checkCollisions(player, oposum);
		// 	if (collisionDirection) {
		// 		if (collisionDirection === "bottom" && !player.isOnGround) {
		// 			player.velocity.y = -200;
		// 			sprites.push(
		// 				new Sprite({
		// 					x: oposum.x,
		// 					y: oposum.y,
		// 					width: 32,
		// 					height: 32,
		// 					imageSrc: "/images/enemy-death.png",
		// 					spriteCropbox: {
		// 						x: 0,
		// 						y: 0,
		// 						width: 40,
		// 						height: 41,
		// 						frames: 6,
		// 					},
		// 				})
		// 			);

		// 			oposums.splice(i, 1);
		// 		} else if ((collisionDirection === "left" || collisionDirection === "right") && player.isOnGround && player.isRolling) {
		// 			sprites.push(
		// 				new Sprite({
		// 					x: oposum.x,
		// 					y: oposum.y,
		// 					width: 32,
		// 					height: 32,
		// 					imageSrc: "/images/enemy-death.png",
		// 					spriteCropbox: {
		// 						x: 0,
		// 						y: 0,
		// 						width: 40,
		// 						height: 41,
		// 						frames: 6,
		// 					},
		// 				})
		// 			);

		// 			oposums.splice(i, 1);
		// 		} else if (collisionDirection === "left" || collisionDirection === "right") {
		// 			const fullHearts = hearts.filter((heart) => {
		// 				return !heart.depleted;
		// 			});

		// 			if (!player.isInvincible && fullHearts.length > 0) {
		// 				fullHearts[fullHearts.length - 1].depleted = true;
		// 			} else if (fullHearts.length === 0) {
		// 				init();
		// 			}

		// 			player.setIsInvincible();
		// 		}
		// 	}
		// }

		// Update eagle position
		for (let i = eagles.length - 1; i >= 0; i--) {
			const eagle = eagles[i];
			eagle.update(timeStep, collisionBlocks);

			// Jump on enemy
			const collisionDirection = checkCollisions(player, eagle);
			if (collisionDirection) {
				if (collisionDirection === "bottom" && !player.isOnGround) {
					player.velocity.y = -200;
					sprites.push(
						new Sprite({
							x: eagle.x,
							y: eagle.y,
							width: 32,
							height: 32,
							imageSrc: "/images/enemy-death.png",
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
				} else if (collisionDirection === "left" || collisionDirection === "right" || collisionDirection === "top") {
					const fullHearts = hearts.filter((heart) => {
						return !heart.depleted;
					});

					if (!player.isInvincible && fullHearts.length > 0) {
						fullHearts[fullHearts.length - 1].depleted = true;
					} else if (fullHearts.length === 0) {
						init();
					}

					player.setIsInvincible();
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
						imageSrc: "/images/item-feedback.png",
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

				if (gems.length === 0) {
					console.log("YOU WIN!");
				}
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

	// for (let i = oposums.length - 1; i >= 0; i--) {
	// 	const oposum = oposums[i];
	// 	oposum.draw(c);
	// }

	for (let i = eagles.length - 1; i >= 0; i--) {
		const eagle = eagles[i];
		eagle.draw(c);
	}

	for (let i = sprites.length - 1; i >= 0; i--) {
		const sprite = sprites[i];
		sprite.draw(c);
	}

	for (let i = gems.length - 1; i >= 0; i--) {
		const gem = gems[i];
		gem.draw(c);
	}

	c.restore();

	// UI save and restore
	c.save();
	c.scale(dpr + 1, dpr + 1);
	for (let i = hearts.length - 1; i >= 0; i--) {
		const heart = hearts[i];
		heart.draw(c);
	}

	gemUI.draw(c);
	c.fillText(gemCount, 33, 46);
	c.restore();

	requestAnimationFrame(() => animate(backgroundCanvas));
}

async function startRendering() {
	try {
		if (!canvas || !c) {
			throw new Error('Canvas not initialized');
		}
		console.log("it has been loaded successfully")
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

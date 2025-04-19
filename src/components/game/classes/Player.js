import bullet from "./bullet";

const X_VELOCITY = 200;
const JUMP_POWER = 350;
const GRAVITY = 580;

class Player {
	constructor({ x, y, size, velocity = { x: 0, y: 0 }, camera }) {
		this.x = x;
		this.y = y;
		this.width = size;
		this.height = size;
		this.velocity = velocity;
		this.camera = camera; // Store camera reference
		this.isOnGround = false;
		this.isImageLoaded = false;
		this.health = 100;
		this.image = new Image();
		this.bullets = []; // in constructor

		this.image.onload = () => {
			this.isImageLoaded = true;
		};

		this.image.onerror = () => {
			console.error("Failed to load character image:", this.image.src);
		};

		this.image.src = '/src/components/game/images/character.png';

		this.elapsedTime = 0;
		this.currentFrame = 0;
		this.speed = 5;
		this.jumpStrength = -JUMP_POWER;
		this.groundLevel = 400;

		this.sprites = {
			idle: {
				x: 0,
				y: 0,
				width: 33,
				height: 32,
				frames: 4,
			},
			run: {
				x: 0,
				y: 32,
				width: 33,
				height: 32,
				frames: 6,
			},
			jump: {
				x: 0,
				y: 32 * 5,
				width: 33,
				height: 32,
				frames: 1,
			},
			fall: {
				x: 33,
				y: 32 * 5,
				width: 33,
				height: 32,
				frames: 1,
			},
			roll: {
				x: 0,
				y: 32 * 9,
				width: 33,
				height: 32,
				frames: 4,
			},
		};

		this.currentSprite = this.sprites.idle;
		this.facing = "right";
		this.hitbox = {
			x: 0,
			y: 0,
			width: 20,
			height: 23,
		};
		this.isInvincible = false;
		this.isRolling = false;
		this.isInAirAfterRolling = false;

		this.jumpKeyReleased = true;
		this.canJump = true;
	}

	setIsInvincible() {
		this.isInvincible = true;
		setTimeout(() => {
			this.isInvincible = false;
		}, 1500);
	}

	draw(c) {
		if (this.isImageLoaded) {
			let xScale = 1;
			let x = this.x;

			if (this.facing === "left") {
				xScale = -1;
				x = -this.x - this.width;
			}

			c.save();
			if (this.isInvincible) {
				c.globalAlpha = 0.5;
			} else {
				c.globalAlpha = 1;
			}
			c.scale(xScale, 1);

			try {
				// First approach: Simplified drawing - just draw the whole image
				c.drawImage(this.image, x, this.y, this.width, this.height);

				// Draw hitbox for debugging
				// c.strokeStyle = 'red';
				// c.lineWidth = 2;
				// c.strokeRect(
				// 	this.hitbox.x * xScale, 
				// 	this.hitbox.y, 
				// 	this.hitbox.width, 
				// 	this.hitbox.height
				// );

				// If the above works, then we can try the more complex sprite sheet approach:
				/*
				c.drawImage(
					this.image, 
					this.currentSprite.x + this.currentSprite.width * this.currentFrame, 
					this.currentSprite.y, 
					this.currentSprite.width, 
					this.currentSprite.height, 
					x, 
					this.y, 
					this.width, 
					this.height
				);
				*/
			} catch (err) {
				console.error("Error drawing player sprite:", err);
			}
			c.restore();
		} else {
			// Placeholder
			c.fillStyle = "rgba(255, 255, 0, 0.8)";
			c.fillRect(this.x, this.y, this.width, this.height);
		}
	}

	update(deltaTime, collisionBlocks) {
		if (!deltaTime) return;

		// Updating animation frames
		this.elapsedTime += deltaTime;
		const secondsInterval = 0.1;
		if (this.elapsedTime > secondsInterval) {
			this.currentFrame = (this.currentFrame + 1) % this.currentSprite.frames;
			this.elapsedTime -= secondsInterval;
		}

		if (this.isRolling && this.currentFrame === 3) {
			this.isRolling = false;
		}

		// Update hitbox position
		this.hitbox.x = this.x + 4;
		this.hitbox.y = this.y + 9;

		// Apply gravity
		this.applyGravity(deltaTime);

		// Update horizontal position and check collisions
		this.updateHorizontalPosition(deltaTime);
		if (collisionBlocks) {
			this.checkForHorizontalCollisions(collisionBlocks);
		}

		// Check for any platform collisions
		if (window.platforms) {
			this.checkPlatformCollisions(window.platforms, deltaTime);
		}

		// Update vertical position and check collisions
		this.updateVerticalPosition(deltaTime);
		if (collisionBlocks) {
			this.checkForVerticalCollisions(collisionBlocks);
		}

		this.determineDirection();
		this.switchSprites();
	}

	roll() {
		if (this.isOnGround) {
			this.currentSprite = this.sprites.roll;
			this.currentFrame = 0;
			this.isRolling = true;
			this.isInAirAfterRolling = true;
			this.velocity.x = this.facing === "right" ? 300 : -300;
		}
	}

	determineDirection() {
		if (this.velocity.x > 0) {
			this.facing = "right";
		} else if (this.velocity.x < 0) {
			this.facing = "left";
		}
	}

	switchSprites() {
		if (this.isRolling) return;

		if (this.isOnGround && this.velocity.x === 0 && this.currentSprite !== this.sprites.idle) {
			// Idle
			this.currentFrame = 0;
			this.currentSprite = this.sprites.idle;
		} else if (this.isOnGround && this.velocity.x !== 0 && this.currentSprite !== this.sprites.run) {
			// Run
			this.currentFrame = 0;
			this.currentSprite = this.sprites.run;
		} else if (!this.isOnGround && this.velocity.y < 0 && this.currentSprite !== this.sprites.jump) {
			// Jump
			this.currentFrame = 0;
			this.currentSprite = this.sprites.jump;
		} else if (!this.isOnGround && this.velocity.y > 0 && this.currentSprite !== this.sprites.fall) {
			// Fall
			this.currentFrame = 0;
			this.currentSprite = this.sprites.fall;
		}
	}

	jump() {
		if (this.isOnGround && this.canJump) {
			this.velocity.y = -JUMP_POWER;
			this.isOnGround = false;
			this.canJump = false;
		}
	}

	updateHorizontalPosition(deltaTime) {
		this.x += this.velocity.x * deltaTime;
		this.hitbox.x += this.velocity.x * deltaTime;
	}

	updateVerticalPosition(deltaTime) {
		this.y += this.velocity.y * deltaTime;
		this.hitbox.y += this.velocity.y * deltaTime;
	}

	applyGravity(deltaTime) {
		this.velocity.y += GRAVITY * deltaTime;
	}

	handleInput(keys) {
		if (this.isRolling || this.isInAirAfterRolling) return;

		this.velocity.x = 0;

		// Handle horizontal movement
		if (keys.d.pressed || keys.ArrowRight.pressed) {
			this.velocity.x = X_VELOCITY;
		} else if (keys.a.pressed || keys.ArrowLeft.pressed) {
			this.velocity.x = -X_VELOCITY;
		}

		// Handle jumping
		if ((keys.Space.pressed || keys.w.pressed || keys.ArrowUp.pressed) && this.isOnGround && this.jumpKeyReleased && this.canJump) {
			this.jump();
			this.jumpKeyReleased = false;
		}

		if (!keys.Space.pressed && !keys.w.pressed && !keys.ArrowUp.pressed) {
			this.jumpKeyReleased = true;
		}
	}

	stopRoll() {
		this.velocity.x = 0;
		this.isRolling = false;
		this.isInAirAfterRolling = false;
	}

	checkForHorizontalCollisions(collisionBlocks) {
		const buffer = 0.0001;
		for (let i = 0; i < collisionBlocks.length; i++) {
			const collisionBlock = collisionBlocks[i];

			// Check if a collision exists on all axes
			if (this.hitbox.x <= collisionBlock.x + collisionBlock.width && this.hitbox.x + this.hitbox.width >= collisionBlock.x && this.hitbox.y + this.hitbox.height >= collisionBlock.y && this.hitbox.y <= collisionBlock.y + collisionBlock.height) {
				// Check collision while player is going left
				if (this.velocity.x < -0) {
					this.hitbox.x = collisionBlock.x + collisionBlock.width + buffer;
					this.x = this.hitbox.x - 4;
					this.stopRoll();
					break;
				}

				// Check collision while player is going right
				if (this.velocity.x > 0) {
					this.hitbox.x = collisionBlock.x - this.hitbox.width - buffer;
					this.x = this.hitbox.x - 4;
					this.stopRoll();
					break;
				}
			}
		}
	}

	checkForVerticalCollisions(collisionBlocks) {
		const buffer = 0.0001;
		for (let i = 0; i < collisionBlocks.length; i++) {
			const collisionBlock = collisionBlocks[i];

			// If a collision exists
			if (this.hitbox.x <= collisionBlock.x + collisionBlock.width && this.hitbox.x + this.hitbox.width >= collisionBlock.x && this.hitbox.y + this.hitbox.height >= collisionBlock.y && this.hitbox.y <= collisionBlock.y + collisionBlock.height) {
				// Check collision while player is going up
				if (this.velocity.y < 0) {
					this.velocity.y = 0;
					this.hitbox.y = collisionBlock.y + collisionBlock.height + buffer;
					this.y = this.hitbox.y - 9;
					break;
				}

				// Check collision while player is going down
				if (this.velocity.y > 0) {
					this.velocity.y = 0;
					this.y = collisionBlock.y - this.height - buffer;
					this.hitbox.y = collisionBlock.y - this.hitbox.height - buffer;
					this.isOnGround = true;
					this.canJump = true;

					if (!this.isRolling) this.isInAirAfterRolling = false;
					break;
				}
			}
		}
	}

	checkPlatformCollisions(platforms, deltaTime) {
		const buffer = 0.0001;
		for (let platform of platforms) {
			if (platform.checkCollision(this, deltaTime)) {
				this.velocity.y = 0;
				this.y = platform.y - this.height - buffer;
				this.isOnGround = true;
				this.canJump = true;
				return;
			}
		}
		this.isOnGround = false;
	}

	fire() {
		// Get the player's current position relative to the camera
		const playerScreenX = this.x - this.camera.x;
		const playerScreenY = this.y - this.camera.y;
		
		// Create bullet at the player's screen position
		const bulletX = this.facing === "right" ? playerScreenX + this.width : playerScreenX - 10;
		const bulletY = playerScreenY + this.height / 2;
		
		this.bullets.push(new bullet(bulletX, bulletY, this.facing === "right" ? 8 : -8));
	}
}

export default Player;
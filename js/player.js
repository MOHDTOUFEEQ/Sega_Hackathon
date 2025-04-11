// # Player class, movement, shooting, health

export default class Player {
    constructor(x, y,imageSrc) {
      this.x = x;
      this.y = y;
      this.width = 80;
      this.height = 100;
      this.color = 'blue';
      this.velY = 0; 
      this.jumping = false;
      this.speed = 5;
      this.jumpStrength = -10;
      this.gravity = 0.5;
      this.image = new Image();
      this.image.src = imageSrc;  // Add the image source path
      this.groundLevel = 400;
    }
  
    update(keys, canvasHeight) {
      // Gravity
      
      if (this.y + this.height < this.groundLevel) {
          this.velY += this.gravity;
          this.jumping = true;
        } else {
        this.velY = 0;
        this.jumping = false; 
        this.y = this.groundLevel - this.height;
      }
  
      // Jump
    if (keys['Space'] && !this.jumping) {
        this.velY = this.jumpStrength;
    }
    
    // Movement
    if (keys['ArrowRight']) this.x += this.speed;
    if (keys['ArrowLeft']) this.x -= this.speed;
      // Apply vertical velocity
      
      this.y += this.velY;
    }
  
    draw(ctx) {
        console.log("no yes");
        if (this.image.complete) {
            console.log("no");
            
            ctx.drawImage(this.image, this.x, this.y, this.width, this.height);
          }
    //   ctx.fillStyle = this.color;
    //   ctx.fillRect(this.x, this.y, this.width, this.height);
    }
  }
  
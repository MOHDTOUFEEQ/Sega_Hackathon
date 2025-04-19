// # Bullet behavior (position, direction, collisions)


class bullet {
  constructor(x, y, speed = 8) {
    this.x = x;
    this.y = y;
    this.width = 10;
    this.height = 5;
    this.speed = speed;
    this.color = 'yellow';
    console.log("Bullet created at:", x, y);
  }

  update() {
    this.x += this.speed;
  }

  draw(c) {
    c.fillStyle = this.color;
    c.fillRect(this.x, this.y, this.width, this.height);
  }
}
  
export default bullet;
/**ghosts function in an array of images --sprites */
function Ghost(x,y,img,theField) {
    this.gX = x;
    this.gY = y;
    console.log(this.gX,this.gY);
    this.img = img;
    this.frame = 0;
    this.direction = 0;
    this.radius = 5;
    this.movement= true;
    this.isScared = false;
  

    this.show = function() {
        if(this.isScared === false)
            image(img, this.gX, this.gY, 32, 32, 0,0,32,32)
        else {
            image(weakImg, this.gX, this.gY, 32, 32, 0,0,32,32)
        }
        // this.direction = (this.direction === 3)?0:this.direction;
      
    }
    /**d = position */
    this.ghostMove = function(tiles) {
        if(this.movement === false) {
            var d = floor(random(4));
            this.direction = d;
        }
        var lastx = this.gX;
        var lasty = this.gY;
        if(this.direction === 0) {
            this.gX += 32;
        }
        if(this.direction === 1) {
            this.gY += 32;
        }
        if(this.direction === 2) {
            this.gX -= 32;
        }
        if(this.direction === 3) {
            this.gY -= 32;
        }
        for(var i = 0; i < tiles.length; i++) {
            if(this.colission(tiles[i])) {
                this.gX = lastx;
                this.gY = lasty;
                this.movement = false;
                this.ghostMove(tiles);
            }
            else {
                this.movement = true;
            }
        }
        if(this.gX < 0)
            this.gX = width -32;
        if(this.gX >= width)
            this.gX = 0;
    
    }
    this.colission = function(tile) {
        var distance = dist(this.gX, this.gY, tile.tX, tile.tY);
            if(distance < this.radius + tile.radius)
                return true;
            return false;
    }
    this.ghostRespawn = function() {
        // this.gX = 448;
        // this.gY = 320;
        this.gX = x;
        this.gY = y;
    }
}

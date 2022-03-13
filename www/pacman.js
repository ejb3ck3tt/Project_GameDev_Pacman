/**pacman constructor*/
class Pacman {
    constructor(x,y) {
        this.x = x;
        this.y = y;
        this.frame = 0;
        this.direction = 0;
        this.radius = 5;
        this.xspeed = 1;
        this.yspeed = 0;
      
        this.show = function() {
            image(pacmanImg, this.x , this.y , 32 , 32 , 32*this.frame++ , 32*this.direction  ,32  , 32);
            this.frame = (this.frame === 6)?0:this.frame;               
        }

        /** setting control direction movement
        * - ----- x ----- +
        *  |       3     |
        *  | 2     1   0 |
        *   ------------
        *         +  
        */         
        this.move = function(m) {
            this.direction = m;
            //right
            if(this.direction === 0) {
                this.x += 32;
              
            }
            //down
            if(this.direction === 1) {
                this.y += 32;
               
            }
            //left
            if(this.direction === 2) {
                this.x -= 32;
                
            //up
            }
            if(this.direction === 3) {
                this.y -= 32;
              
            }

            if(this.x < 0) {
                this.x = width -32;
            }
            if(this.x >= width) {
                this.x =0;
            }
            

        }

        /**Pacman-pelette distance check in 10 radius */
        this.eat = function(pelette) {
            var distance = dist(this.x, this.y, pelette.pX, pelette.pY);
                if(distance < this.radius + pelette.radius)
                    return true;
                return false;       
        }
        /**Pacman-energizer distance check in 10 radius */
        this.energize = function(energizer) {
            var distance = dist(this.x, this.y, energizer.eX, energizer.eY);
                if(distance < this.radius + energizer.radius)
                    return true;
                return false;
        }    
        
        this.colission = function(ghost) {
            var distance = dist(this.x, this.y, ghost.gX, ghost.gY);
                if(distance < this.radius + ghost.radius)
                    return true;
                return false;
        }  

        this.eatFruit = function(fruit) {
            var distance = dist(this.x, this.y, fruit.fX, fruit.fY);
                if(distance < this.radius + fruit.radius)
                    return true;
                return false;
        }   

        this.respawn = function() {
            this.x = 448;
            this.y = 576;
        }
    }
}
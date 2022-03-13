/**fruit constructor will be called when energizer is consumed*/
class Fruit{
    constructor(x,y) {
        this.fX = x;
        this.fY = y;
        this.radius = 10;
        
        this.show = function() {
            image(fruitImg,this.fX,this.fY);
        }
    }
}

/**level constructor will be called when a level is completed */
class Level {
    constructor(x,y) {
        this.vX = x;
        this.vY = y;
        
        this.show = function() {
            image(fruitImg,this.vX,this.vY);
        }
    }
}
/**Create fields constructor for the field using array */
class Fields {
    constructor() {
        this.rows = 25;
        this.column = 30;
        this.theField = [
          ['*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*'],
          ['*','-','-','-','-','-','-','-','-','-','-','-','-','-','*','*','-','-','-','-','-','-','-','-','-','-','-','-','-','*'],
          ['*','-','*','*','*','*','-','*','*','*','*','*','*','-','*','*','-','*','*','*','*','*','*','-','*','*','*','*','-','*'],
          ['*','o','*','*','*','*','-','*','*','*','*','*','*','-','*','*','-','*','*','*','*','*','*','-','*','*','*','*','o','*'],
          ['*','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','*'],
          ['*','-','*','*','*','*','-','*','*','-','*','*','*','*','*','*','*','*','*','*','-','*','*','-','*','*','*','*','-','*'],
          ['*','-','-','-','-','-','-','*','*','-','-','-','-','-','*','*','-','-','-','-','-','*','*','-','-','-','-','-','-','*'],
          ['*','*','*','*','*','*','-','*','*','*','*','*','*','z','*','*','z','*','*','*','*','*','*','-','*','*','*','*','*','*'],
          ['z','z','z','z','z','*','-','*','*','z','z','z','z','z','z','z','z','z','z','z','z','*','*','-','*','z','z','z','z','z'],
          ['z','z','z','z','z','*','-','*','*','z','*','*','*','*','*','*','z','z','*','*','z','*','*','-','*','z','z','z','z','z'],
          ['*','*','*','*','*','*','-','*','*','z','*','*','z','z','n','i','b','c','*','*','z','*','*','-','*','*','*','*','*','*'],
          ['z','z','z','z','z','z','-','z','z','z','*','*','z','z','z','z','z','z','*','*','z','z','z','-','z','z','z','z','z','z'],
          ['*','*','*','*','*','*','-','*','*','z','*','*','*','*','*','*','*','*','*','*','z','*','*','-','*','*','*','*','*','*'],
          ['z','z','z','z','z','*','-','*','*','z','*','*','*','*','*','*','*','*','*','*','z','*','*','-','*','z','z','z','z','z'],
          ['z','z','z','z','z','*','-','*','*','z','z','z','z','z','f','z','z','z','z','z','z','*','*','-','*','z','z','z','z','z'],
          ['*','*','*','*','*','*','-','*','*','z','*','*','*','*','*','*','*','*','*','*','z','*','*','-','*','*','*','*','*','*'],
          ['*','-','-','-','-','-','-','-','-','-','-','-','-','-','*','*','-','-','-','-','-','-','-','-','-','-','-','-','-','*'],
          ['*','-','*','*','*','*','-','*','*','*','*','*','*','-','*','*','-','*','*','*','*','*','*','-','*','*','*','*','-','*'],
          ['*','o','-','-','*','*','-','-','-','-','-','-','-','-','p','-','-','-','-','-','-','-','-','-','*','*','-','-','o','*'],
          ['*','*','*','-','*','*','-','*','*','-','*','*','*','*','*','*','*','*','*','*','-','*','*','-','*','*','-','*','*','*'],
          ['*','-','-','-','-','-','-','*','*','-','-','-','-','-','*','*','-','-','-','-','-','*','*','-','-','-','-','-','-','*'],
          ['*','-','*','*','*','*','*','*','*','*','*','*','*','-','*','*','-','*','*','*','*','*','*','*','*','*','*','*','-','*'],
          ['*','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','-','*'],
          ['*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*','*'],
          ['z','l','l','l','z','z','v','z']   
        ]
    }
}

/**Tile constructor*/ 
class Tile {
    constructor (x,y) {
        this.tX = x;
        this.tY = y;
        this.radius = 15;
        this.show = function() {
            image(tileImg,this.tX,this.tY);
        }
    }
}



/**Pelettes constructor*/
class Pelette {
    constructor(x,y) {
        this.pX = x
        this.pY = y
        this.radius = 10;
        this.show = function() {
            image(peletteImg, this.pX, this.pY); 
        }
    }
}

/**Energizer Constructor*/
class Energizer {
    constructor(x,y) {
        this.eX = x;
        this.eY = y;
        this.radius = 10;
    
        this.show = function() {
            image(energyImg,this.eX,this.eY);
        }       
    }
}

/**Life Constructor */
class Life {
    constructor(x,y) {
        this.lX = x;
        this.lY = y;
        
        this.show = function() {
            image(livesImg,this.lX,this.lY);
        }
    }
}

/**Function highscore*/
function drawHighScore() {
    fill(255);
    textSize(20);
    text('HighScore:  ' + score, width/2 + 100, height/2 + 380);
}

/**Function 1up score -player score*/
function drawScore() {
    fill(255, 255, 255);
    textSize(20);
    text('1up:  ' + score, width/2 + 300, height/2 + 380);
    
    
}
//button variables CONST applied as variables are
const MAIN_MENU = 0;
const PLAY = 1;
const HIGH_SCORE = 2;
const END_GAME = 3;
const HIGH_SCORE_STORAGE_KEY = "pacmanHighScores";
const DEFAULT_HIGH_SCORES = [0, 0, 0, 0];

/**variables for object images */
var tileImg, peletteImg, energyImg, pacmanImg,livesImg;
var fruitImg, weakImg;
/**variables for ghosts images */
var clydeImg, pinkyImg, inkyImg, clydeImg;
/**variables for objects */
var tile,field,pacman,fruit,level,w;
/**variables for ghost objects */
var blinky,pinky,inky,clyde;
/**variables for scores starts at 0 */
var score = 0;
// let newHighScore = [1200,3200,4000,5600];
let newHighScore = DEFAULT_HIGH_SCORES.slice();
var highScore = 0;
var gameOverMessage = "";
var gameOverSaved = false;
var lastAudioScreen = null;
var playIntroActive = false;
/**New Arrays to use for constructor */
var tiles =[];
var pelettes =[];
var energizers = [];
var lives = []; 
var ghosts = [];
var activeGhosts = [];
var levels =[];
var fruits = [];

//var Sounds
var interSound;
var chompSound;
var deathSound;
var eatFruitSound;
var eatGhostSound;
// var begSound;
var begSound;

//button variable functions  for different screens events
let currentScreen = MAIN_MENU;
let playButton1, playButton2, playButton3, playButton4;

function preload() {
    soundFormats('mp3', 'ogg');
    interSound = loadSound("./sounds/pacman_intermission.mp3");
    begSound = loadSound("./sounds/pacman_beginning.mp3");
    chompSound = loadSound("./sounds/pacman_chomp.mp3");
    deathSound = loadSound("./sounds/pacman_death.mp3");
    eatGhostSound = loadSound("./sounds/pacman_eatghost.mp3");
    eatFruitSound = loadSound("./sounds/pacman_eatfruit.mp3");

    pachead = loadImage('./images/pacmanhead.png');
    tileImg = loadImage("./images/tile.png");
    peletteImg = loadImage("./images/pelettes.png");
    energyImg = loadImage("./images/energizer.png");
    pacmanImg = loadImage("./images/pac.png");
    blinkyImg = loadImage("./images/blinky.png");
    pinkyImg = loadImage("./images/pinky.png");
    inkyImg = loadImage("./images/inky.png");
    clydeImg = loadImage("./images/clyde.png");
    livesImg = loadImage("./images/paclife.png");
    fruitImg = loadImage("./images/grape.png");
    weakImg = loadImage("./images/weak.png");
    
    
    // chompSound;
    // deathSound;
    // eatFruitSound;
    // eatGhostSound;
    // 
}

function setup() {
    createCanvas(960, 820);

    slider = createSlider(0,1,0.1,0.01);
    loadHighScores();
    begSound.setVolume(0.2);
    
    tile = new Tile(200,300);
    field = new Fields();
     //creates buttons to navigate through different screens
     playButton1 = createButton('MAIN MENU');
     playButton1.position(400, height/2 - playButton1.size(100, 40).width);
     playButton1.mouseClicked(playMenuButton);
 
     playButton2 = createButton('PLAY');
     playButton2.position(400, height/2 + 50 - playButton2.size(100, 40).width);
     playButton2.mouseClicked(playButtonGame);
     
 
     playButton3 = createButton('HIGHSCORE');
     playButton3.position(400, height/2 + 100 - playButton3.size(100, 40).width);
     playButton3.mouseClicked(playpHighScore);

     playButton4 = createButton('END GAME');
     playButton4.position(400, height/2 + 470 - playButton4.size(100, 40).width);
     playButton4.mouseClicked(endGame);

     
 
    //functions used to show and hide buttons as per the screen events
    function playMenuButton() {
        if(currentScreen === END_GAME) {
            window.location.reload();
            return;
        }
        currentScreen = MAIN_MENU;
        playButton1.position(400, height/2 - playButton1.size(100, 40).width);
        playButton1.show();
        playButton2.show();
        playButton3.show();
        playButton4.hide();
    }
    function playButtonGame(){
        currentScreen = PLAY;
        gameOverMessage = "";
        gameOverSaved = false;
        reset();
        playIntroActive = true;
        begSound.setVolume(slider.value());
        begSound.play();
        lastAudioScreen = PLAY;
        playButton1.hide();
        playButton2.hide();
        playButton3.hide();
        playButton4.show();
        
    }
    function playpHighScore() {
        currentScreen = HIGH_SCORE;
        playButton1.show();
        playButton1.position(width/2 - 55, height - 85);
        playButton2.hide();
        playButton3.hide();
        playButton4.hide();
    }
    function endGame() {
        window.location.reload();
    }


    
    /**field construction for rows and columns */
    for(var i = 0; i < field.rows; i++) {
        for(var j = 0; j < field.column; j++) {
            if(field.theField[i][j] === '*') 
                tiles.push(new Tile(j * 32,i * 32))
            /**pelettes position in the array field */      
            if(field.theField[i][j] === '-') 
                pelettes.push(new Pelette(j * 32 + 5,i * 32 +5)) 
             /**Energizer position in the array field */ 
            if(field.theField[i][j] === 'o') 
                energizers.push(new Energizer(j * 32 +2,i * 32 +2)) 
            /**pacman position in the array field */ 
            if(field.theField[i][j] === 'p') 
                pacman=new Pacman(j * 32,i * 32 ) 
            /**ghosts position in the array field */
            if(field.theField[i][j] === 'b')
                ghosts.push(new Ghost(j*32, i * 32,blinkyImg))
            if(field.theField[i][j] === 'n')
                ghosts.push(new Ghost(j*32, i * 32,pinkyImg))
            if(field.theField[i][j] === 'i')
                ghosts.push(new Ghost(j*32, i * 32,inkyImg))
            if(field.theField[i][j] === 'c')
                ghosts.push(new Ghost(j*32, i * 32,clydeImg))
            /**lives position in array field */
            if(field.theField[i][j] === 'l') 
                lives.push(new Life(j * 32,i * 32))
            /**fruit position in the array field */
            if(field.theField[i][j] === 'f') 
                fruits.push(new Fruit(j * 32,i * 32))
            /**levels position in the array field */
            if(field.theField[i][j] === 'v')
                levels.push(new Level(j * 32,i * 32))              
        }  
	    } 
	}

function loadHighScores() {
    try {
        var savedHighScores = localStorage.getItem(HIGH_SCORE_STORAGE_KEY);
        if(savedHighScores === null) {
            newHighScore = DEFAULT_HIGH_SCORES.slice();
            saveHighScores();
            return;
        }
        var parsedScores = JSON.parse(savedHighScores);
        if(Array.isArray(parsedScores) && parsedScores.length > 0) {
            newHighScore = parsedScores.filter(function(value) {
                return typeof value === "number" && isFinite(value);
            }).sort(function(a, b) {
                return b - a;
            }).slice(0, 4);
            while(newHighScore.length < 4) {
                newHighScore.push(0);
            }
        }
        else {
            newHighScore = DEFAULT_HIGH_SCORES.slice();
        }
    }
    catch(error) {
        newHighScore = DEFAULT_HIGH_SCORES.slice();
    }
}

function saveHighScores() {
    try {
        localStorage.setItem(HIGH_SCORE_STORAGE_KEY, JSON.stringify(newHighScore));
    }
    catch(error) {
    }
}

function updateBackgroundAudio() {
    if(!begSound) {
        return;
    }
    if(playIntroActive === true) {
        begSound.setVolume(slider.value());
        return;
    }
    try {
        if(currentScreen === lastAudioScreen) {
            return;
        }
        lastAudioScreen = currentScreen;
        if(begSound.isPlaying() === true) {
            begSound.stop();
        }
    }
    catch(error) {
    }
}

function reset() {
    begSound.stop();
    chompSound.stop();
    deathSound.stop();
    lastAudioScreen = null;
    playIntroActive = false;
}

function syncButtonsForScreen() {
    if(currentScreen === PLAY) {
        playButton1.hide();
        playButton2.hide();
        playButton3.hide();
        playButton4.show();
        return;
    }
    if(currentScreen === HIGH_SCORE) {
        playButton1.show();
        playButton1.position(width/2 - 55, height - 85);
        playButton2.hide();
        playButton3.hide();
        playButton4.hide();
        return;
    }
    if(currentScreen === END_GAME) {
        playButton1.show();
        playButton1.position(400, height - 70);
        playButton2.hide();
        playButton3.hide();
        playButton4.hide();
        return;
    }
    playButton1.show();
    playButton1.position(400, height/2 - playButton1.size(100, 40).width);
    playButton2.show();
    playButton3.show();
    playButton4.hide();
}


	    function draw() {
	        background(0);
	        updateBackgroundAudio();
	        syncButtonsForScreen();
	        
	        switch(currentScreen) {
            case MAIN_MENU:
                drawMainMenuScreen();
                break;
            case PLAY:
                if(playIntroActive === true) {
                    drawPlayIntroScreen();
                    break;
                }
                drawPlayScreen();
                break;
            case HIGH_SCORE:
                drawHighScore();
                break;
            case END_GAME:
                drawEndGameScreen();
                break;
     
        }
        function drawMainMenuScreen() {
            image(pachead,40,50);
            textSize(20);
            fill(255);
            text("Ethel Beckett | s5125717", 325, 500);
            text("Click play and Use ARROW KEYS to play the game", 210, 550);
            
        }

        function drawPlayIntroScreen() {
            if(begSound.isPlaying() === false) {
                playIntroActive = false;
                return;
            }
            background(0);
            fill(255, 255, 0);
            textAlign(CENTER, CENTER);
            textSize(52);
            text("READY!", width/2, height/2 - 20);
            textSize(24);
            fill(255);
            text("Pac-Man theme is playing...", width/2, height/2 + 40);
            textAlign(LEFT, BASELINE);
        }

	        function drawHighScore() {
	            background(15, 15, 35);
	            noStroke();
	            fill(30, 30, 60);
	            rect(220, 130, 520, 420, 20);
	            fill(255, 210, 60);
	            textAlign(CENTER, CENTER);
	            textSize(42);
	            text("HIGH SCORES", width/2, 185);
	            fill(180, 180, 220);
	            textSize(18);
	            text("Top 4 Pac-Man runs", width/2, 225);
	            for(var i=0; i < newHighScore.length; i++) {
	                var rowY = 295 + i * 62;
	                fill(50, 50, 90);
	                rect(280, rowY - 25, 400, 44, 10);
	                fill(i === 0 ? color(255, 210, 60) : color(255));
	                textSize(28);
	                text((i + 1) + ".  " + newHighScore[i], width/2, rowY - 3);
	            }
	            textAlign(LEFT, BASELINE);
	        }

	        function drawEndGameScreen() {
	            background(128);
	            fill(0);
	            textAlign(CENTER, CENTER);
	            textSize(84);
	            text("G A M E   O V E R", width/2, 240);
	            textSize(38);
	            text("Final Score: " + score, width/2, 390);
	            if(gameOverMessage !== "") {
	                textSize(34);
	                text(gameOverMessage, width/2, 470);
	            }
	            textAlign(LEFT, BASELINE);
	        }
	    }


    function drawPlayScreen() {
            /**Display the field */
     
    for(var i = 0; i < tiles.length; i++)
        tiles[i].show();
    for(var i = 0; i < pelettes.length; i++)
        pelettes[i].show();
        
    
    
    
    /** Display pacman*/ 
    pacman.show();
    
    text('HighScore:  ' + newHighScore[0], width/2 + 100, height/2 + 380);
    
    //call scoreboard
    drawScore();
    
    
    /** If pacman eats pelettes remove 1 + add score by 10*/ 
    for(var i = 0; i < pelettes.length; i++) {
        if(pacman.eat(pelettes[i])) {
            pelettes.splice(i,1)
            score = score + 10;
            if(chompSound.isPlaying()== false) {
                chompSound.setVolume(0.5);
                chompSound.play();
            }  
        }
    }
    if(pelettes.length <=0) {
        alert("Y O U  W I N");
        return window.location.reload();
    }


    for(var i = 0; i < energizers.length; i++) {
        energizers[i].show();
        if(pacman.energize(energizers[i])) {
            eatFruitSound.play();
            energizers.splice(i,1)
            score = score + 50; 
            ghostScared();
        }     
    }
    for(var i=0; i < ghosts.length; i++){
        for(var h = 0; h < fruits.length; h++) {
            if(ghosts[i].isScared === true) {
                fruits[h].show();
                if(pacman.eatFruit(fruits[h])) {
                    eatFruitSound.play();
                    fruits.splice(h,1);
                    score = score + 700;
                }
            }
        } 
    }

    /**Display all ghosts */ 
    for(var i = 0; i < ghosts.length; i++) {
            frameRate(8);
            ghosts[i].ghostMove(tiles);
            ghosts[i].show();
            
    }
    
    for(var i = 0; i < lives.length; i++)
        lives[i].show()      

    for(var i=0; i < ghosts.length; i++) {  
        if(pacman.colission(ghosts[i])) {
            if(ghosts[i].isScared === true) {
                var eatenGhost = ghosts[i];
                eatenGhost.isScared = false;
                eatGhostSound.play();
                ghosts.splice(i,1);
                score = score + 200;
                ghosts.push(new Ghost(32*12,32*10, eatenGhost.img));
            }
        for(var j=0; j < lives.length; j++) {
            if(pacman.colission(ghosts[i])) {
                deathSound.play();
                lives.splice(j,1);
                pacman.respawn();
                for(var k=0; k < ghosts.length; k++) {
                    ghosts[k].ghostRespawn();
                }
                if(lives.length < 1) {
                    currentScreen = END_GAME;
                    playButton1.show();
                    playButton1.position(400, height - 70);
                    playButton2.hide();
                    playButton3.hide();
                    playButton4.hide();
                    saveScore();
                    return;
                }
            }
        }        
            
        }
    }

    

    /**Display level */
    for(var i = 0; i < levels.length; i++)
        levels[i].show()
    

    
    

    function ghostScared() {
        for(var i = 0; i < ghosts.length; i++)
            ghosts[i].isScared = true;        
    }

    function chasePacman() {
        for(var i=0; i< ghosts.length; i++)
            ghosts[i].isScared = false;
    }


    function saveScore() {
        if(gameOverSaved === true) {
            return;
        }
        gameOverSaved = true;
        var previousLowestHighScore = newHighScore[newHighScore.length - 1];
        var isNewHighScore = score > previousLowestHighScore;
        newHighScore.push(score);
        newHighScore.sort(function(a, b) {
            return b - a;
        });
        if(newHighScore.length > 4) {
            newHighScore.splice(4, newHighScore.length - 4);
        }
        saveHighScores();
        if(isNewHighScore) {
            gameOverMessage = "New HighScore: " + score;
        }
        else {
            gameOverMessage = "No new high score";
        }
        reset();
    }


}

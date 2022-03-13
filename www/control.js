/**Pacman function for control using the arrow keys on keyboard
 * pacman is constraint in the field except not equal to * 
*/
function keyPressed() {
    if(keyCode === RIGHT_ARROW) {
        if(field.theField[pacman.y / 32][pacman.x / 32 + 1] !== '*')
        pacman.move(0); 
        // pacman.dir (1, 0);
    }
    else if (keyCode === DOWN_ARROW) {
        if(field.theField[pacman.y / 32 + 1][pacman.x / 32] !== '*')
        pacman.move(1);
        // pacman.dir(0, 1);
    }
    else if (keyCode === LEFT_ARROW) {
        if(field.theField[pacman.y / 32][pacman.x / 32 - 1] !== '*')
        pacman.move(2);
        // pacman.dir (-1, 0);
    }
    else if (keyCode === UP_ARROW) {
        if(field.theField[pacman.y/ 32 - 1][pacman.x/ 32] !== '*')
           pacman.move(3);
        // pacman.dir(0, -1);

    }
        
}
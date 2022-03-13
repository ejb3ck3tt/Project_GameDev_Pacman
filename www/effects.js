
function playSound() {
  if(begSound.isPlaying()== false) {
    begSound.play();
  }
}

function stopSound() {
  if(begSound.isPlaying() == true) {
    begSound.pause();
  }
}




const moveSound = new Audio("/sounds/move.mp3");

export function playMoveSound() {
  let sound = moveSound;

  sound.currentTime = 0;
  sound.play().catch(() => {});
}

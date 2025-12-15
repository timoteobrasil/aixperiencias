function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function playSteps() {
  const localBoard = createInitialBoard();
  // copie também os números fixos se tiver. [web:87]

  currentIndex = 0;
  for (; currentIndex < steps.length; currentIndex++) {
    const { row, col, value } = steps[currentIndex];
    localBoard[row][col] = value;
    drawBoard(localBoard);
    await delay(50); // 50 ms entre passos (ajuste como quiser). [web:50]
  }
}

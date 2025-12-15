function solveWithSteps(board, steps) {
  backtrack(board, 0, 0, steps);
  console.log("board:", board);
  return steps;
}

function backtrack(board, row, col, steps) {
  if (row === SIZE) return true;

  const nextRow = col === SIZE - 1 ? row + 1 : row;
  const nextCol = (col + 1) % SIZE;

  if (board[row][col] !== 0) {
    return backtrack(board, nextRow, nextCol, steps);
  }

  for (let val = 1; val <= 9; val++) {
    if (isValid(board, row, col, val)) {
      board[row][col] = val;
      steps.push({ row, col, value: val }); // registra passo
      if (backtrack(board, nextRow, nextCol, steps)) {
        return true;
      }
      board[row][col] = 0;
      // se quiser, também pode registrar passos de backtrack, por exemplo value: 0
    }
  }
  return false;
}

function isValid(board, row, col, val) {
  for (let i = 0; i < SIZE; i++) {
    if (board[row][i] === val) return false;
    if (board[i][col] === val) return false;
  }
  //TODO verifica bloco 3x3
  const startRow = Math.floor(row / 3) * 3;
  const startCol = Math.floor(col / 3) * 3;
  for (let r = startRow; r < startRow + 3; r++) {
    for (let c = startCol; c < startCol + 3; c++) {
      if (board[r][c] === val) return false;
    }
  }
  return true;
}

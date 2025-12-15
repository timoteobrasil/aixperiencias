const SIZE = 9;
const rootStyles = getComputedStyle(document.documentElement);
const colorText = rootStyles.getPropertyValue("--color-text").trim();
const colorPrimary = rootStyles.getPropertyValue("--color-primary").trim();
const fontFamily = rootStyles.getPropertyValue("--color-primary").trim();
const canvas = document.getElementById("sudokuCanvas");
const ctx = canvas.getContext("2d");

let board = createInitialBoard(); // matriz 9x9 com 0 para vazio
let steps = []; // lista de {row, col, value}
let currentIndex = 0;

document.getElementById("solveBtn").onclick = () => {
  steps = [];
  currentIndex = 0;
  solveWithSteps(board, steps); // preenche steps
  drawBoard(board);
};

document.getElementById("playBtn").onclick = () => {
  playSteps();
};

function createInitialBoard() {
  // TODO: retorna um puzzle fixo
  const puzzleString =
    "-4-7--9627--43-8--------437-1-24----6-71--3----48---795-8-------6--5---3-------58";
  return puzzleString
    .split("")
    .map((char) => (char === "-" ? 0 : parseInt(char)))
    .reduce((board, num, idx) => {
      if (idx % SIZE === 0) board.push([]);
      board[board.length - 1].push(num);
      return board;
    }, []);
}

function drawBoard(b) {
  const size = canvas.width;
  const cellSize = size / SIZE;

  ctx.clearRect(0, 0, size, size);

  // grade
  ctx.strokeStyle = colorPrimary;
  for (let i = 0; i <= SIZE; i++) {
    ctx.lineWidth = i % 3 === 0 ? 3 : 1;
    ctx.beginPath();
    ctx.moveTo(i * cellSize, 0);
    ctx.lineTo(i * cellSize, size);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(0, i * cellSize);
    ctx.lineTo(size, i * cellSize);
    ctx.stroke();
  }

  // números
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.font = `${cellSize * 0.6}px Fira Code, monospace`;

  for (let r = 0; r < SIZE; r++) {
    for (let c = 0; c < SIZE; c++) {
      const value = b[r][c];
      if (value !== 0) {
        ctx.fillStyle = colorText;
        ctx.fillText(
          value,
          c * cellSize + cellSize / 2,
          r * cellSize + cellSize / 2
        );
      }
    }
  }
}

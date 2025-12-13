const GRID_SIZE = 9;
const BLOCK_SIZE = 3;

let board = [];
let initialBoard = [];
let selectedCell = null;
let notesMode = false;

function initializeSudoku() {
  const input = document.getElementById("initString").value;
  const errorEl = document.getElementById("errorMessage");

  if (input.length !== 81) {
    errorEl.textContent = "A string deve ter exatamente 81 caracteres!";
    errorEl.classList.add("show");
    return;
  }

  errorEl.classList.remove("show");

  board = [];
  initialBoard = [];

  for (let i = 0; i < 81; i++) {
    const char = input[i];
    const value = /[1-9]/.test(char) ? parseInt(char) : 0;
    board.push(value);
    initialBoard.push(value);
  }

  renderBoard();
  document.querySelector(".sudoku-grid").classList.add("active");
  document.getElementById("controls").classList.add("active");
  document.querySelector(".setup-section").style.display = "none";
  document.querySelector(".button-group").style.display = "none";
}

function renderBoard() {
  const grid = document.getElementById("sudokuGrid");
  grid.innerHTML = "";

  for (let i = 0; i < 81; i++) {
    const cell = document.createElement("button");
    cell.className = "sudoku-cell";
    cell.dataset.index = i;

    if (initialBoard[i] !== 0) {
      cell.classList.add("initial");
      cell.textContent = initialBoard[i];
    } else if (board[i] !== 0) {
      if (typeof board[i] === "object") {
        cell.classList.add("notes");
        cell.textContent = Array.from(board[i])
          .sort((a, b) => a - b)
          .join(" ");
      } else {
        cell.textContent = board[i];
      }
    }

    if (selectedCell === i) {
      highlightCell(cell, i);
    }

    cell.addEventListener("click", () => selectCell(i));
    grid.appendChild(cell);
  }

  checkVictory();
}

function selectCell(index) {
  selectedCell = index;
  renderBoard();
}

function highlightCell(cellEl, index) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const blockRow = Math.floor(row / 3);
  const blockCol = Math.floor(col / 3);

  const cells = document.querySelectorAll(".sudoku-cell");

  cells.forEach((cell, i) => {
    const cellRow = Math.floor(i / 9);
    const cellCol = i % 9;
    const cellBlockRow = Math.floor(cellRow / 3);
    const cellBlockCol = Math.floor(cellCol / 3);

    cell.classList.remove("highlighted", "block");

    if (cellRow === row || cellCol === col) {
      cell.classList.add("highlighted");
    }

    if (cellBlockRow === blockRow && cellBlockCol === blockCol) {
      cell.classList.add("block");
    }
  });

  cellEl.classList.add("highlighted");
  cellEl.classList.add("block");
}

function deleteCell() {
  if (selectedCell !== null && initialBoard[selectedCell] === 0) {
    board[selectedCell] = 0;
    renderBoard();
  }
}

function toggleNotesMode() {
  notesMode = !notesMode;
  document.getElementById("toggleNotesBtn").classList.toggle("active");
  document.getElementById("info").textContent = notesMode
    ? "📝 Modo Notas Ativo"
    : "";
}

document.getElementById("digitInput").addEventListener("keydown", (e) => {
  if (selectedCell === null || initialBoard[selectedCell] !== 0) {
    return;
  }

  const input = e.target.value.trim();

  if (e.key === "Enter") {
    e.preventDefault();

    if (notesMode) {
      if (input.length > 0) {
        const notes = new Set();
        for (let char of input) {
          if (/[1-9]/.test(char)) {
            notes.add(parseInt(char));
          }
        }
        if (notes.size > 0) {
          board[selectedCell] = notes;
        }
      }
    } else {
      if (/^[1-9]$/.test(input)) {
        const digit = parseInt(input);
        board[selectedCell] = digit;

        if (hasConflict(selectedCell, digit)) {
          const cellEl = document.querySelector(
            `[data-index="${selectedCell}"]`
          );
          cellEl.classList.add("error");
          setTimeout(() => cellEl.classList.remove("error"), 1000);
        }
      } else if (input === "") {
        board[selectedCell] = 0;
      }
    }

    e.target.value = "";
    renderBoard();
  }
});

function hasConflict(index, digit) {
  const row = Math.floor(index / 9);
  const col = index % 9;
  const blockRow = Math.floor(row / 3);
  const blockCol = Math.floor(col / 3);

  for (let c = 0; c < 9; c++) {
    const i = row * 9 + c;
    if (i !== index && board[i] === digit) {
      return true;
    }
  }

  for (let r = 0; r < 9; r++) {
    const i = r * 9 + col;
    if (i !== index && board[i] === digit) {
      return true;
    }
  }

  for (let r = blockRow * 3; r < blockRow * 3 + 3; r++) {
    for (let c = blockCol * 3; c < blockCol * 3 + 3; c++) {
      const i = r * 9 + c;
      if (i !== index && board[i] === digit) {
        return true;
      }
    }
  }

  return false;
}

function checkVictory() {
  const isFull = board.every((cell) => typeof cell === "number" && cell !== 0);

  if (!isFull) {
    return;
  }

  if (isValidSolution()) {
    document.getElementById("victoryModal").classList.add("show");
  }
}

function isValidSolution() {
  for (let row = 0; row < 9; row++) {
    const seen = new Set();
    for (let col = 0; col < 9; col++) {
      const value = board[row * 9 + col];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
    }
  }

  for (let col = 0; col < 9; col++) {
    const seen = new Set();
    for (let row = 0; row < 9; row++) {
      const value = board[row * 9 + col];
      if (seen.has(value)) {
        return false;
      }
      seen.add(value);
    }
  }

  for (let blockRow = 0; blockRow < 3; blockRow++) {
    for (let blockCol = 0; blockCol < 3; blockCol++) {
      const seen = new Set();
      for (let r = 0; r < 3; r++) {
        for (let c = 0; c < 3; c++) {
          const value = board[(blockRow * 3 + r) * 9 + (blockCol * 3 + c)];
          if (seen.has(value)) {
            return false;
          }
          seen.add(value);
        }
      }
    }
  }

  return true;
}

function resetToSetup() {
  board = [];
  initialBoard = [];
  selectedCell = null;
  notesMode = false;

  document.getElementById("initString").value = "";
  document.getElementById("digitInput").value = "";
  document.getElementById("errorMessage").classList.remove("show");
  document.querySelector(".sudoku-grid").classList.remove("active");
  document.getElementById("controls").classList.remove("active");
  document.querySelector(".setup-section").style.display = "block";
  document.querySelector(".button-group").style.display = "flex";
  document.getElementById("victoryModal").classList.remove("show");
  document.getElementById("toggleNotesBtn").classList.remove("active");
  document.getElementById("info").textContent = "";
}

document.addEventListener("keydown", (e) => {
  if (selectedCell === null) return;

  if (e.key === "Delete") {
    deleteCell();
  }

  if (/^[1-9]$/.test(e.key)) {
    const digit = parseInt(e.key);
    if (initialBoard[selectedCell] === 0) {
      if (notesMode) {
        if (board[selectedCell] instanceof Set) {
          board[selectedCell].add(digit);
        } else {
          board[selectedCell] = new Set([digit]);
        }
      } else {
        board[selectedCell] = digit;
        if (hasConflict(selectedCell, digit)) {
          const cellEl = document.querySelector(
            `[data-index="${selectedCell}"]`
          );
          cellEl.classList.add("error");
          setTimeout(() => cellEl.classList.remove("error"), 1000);
        }
      }
      renderBoard();
    }
  }

  if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"].includes(e.key)) {
    e.preventDefault();
    const row = Math.floor(selectedCell / 9);
    const col = selectedCell % 9;
    let newIndex = selectedCell;

    switch (e.key) {
      case "ArrowUp":
        if (row > 0) newIndex = selectedCell - 9;
        break;
      case "ArrowDown":
        if (row < 8) newIndex = selectedCell + 9;
        break;
      case "ArrowLeft":
        if (col > 0) newIndex = selectedCell - 1;
        break;
      case "ArrowRight":
        if (col < 8) newIndex = selectedCell + 1;
        break;
    }

    selectCell(newIndex);
  }
});

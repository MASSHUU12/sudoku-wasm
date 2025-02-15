const boardContainer = document.getElementById("board");
const keyboard = document.getElementById("keyboard");
const solveButton = document.getElementById("solve-button");
const decoder = new TextDecoder("utf-8");

class Cell {
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }

  toArray() {
    return [this.x, this.y];
  }
}

let table = null;
let rows = null;
let board = null;
let sideLength = null;
let selectedCell = null;

const { instance } = await WebAssembly.instantiateStreaming(
  fetch("./main.wasm"),
  {
    env: {
      console_log: (ptr, len) => console.log(getString(ptr, len)),
      console_info: (ptr, len) => console.info(getString(ptr, len)),
      console_error: (ptr, len) => console.error(getString(ptr, len)),
      console_warn: (ptr, len) => console.warn(getString(ptr, len)),
    },
  },
);

function getString(ptr, len) {
  const memory = instance.exports.memory;
  const bytes = new Uint8Array(memory.buffer, ptr, len);
  return decoder.decode(bytes);
}

function getBoard() {
  const memory = instance.exports.memory;
  const ptr = instance.exports.get_board();
  const len = instance.exports.get_board_size();
  return new Uint8Array(memory.buffer, ptr, len);
}

function getSolvedBoard() {
  const memory = instance.exports.memory;
  const ptr = instance.exports.get_solved_board();
  const len = instance.exports.get_board_size();
  return new Uint8Array(memory.buffer, ptr, len);
}

function onBoardCellPressed(e) {
  const x = new Number(e.target.getAttribute("data-cell-x"));
  const y = new Number(e.target.getAttribute("data-cell-y"));

  selectedCell = new Cell(x, y);
  drawBoard(board);
}

function drawBoard(board) {
  sideLength = sideLength || instance.exports.get_board_side_length();
  if (!table) {
    table = document.createElement("table");
    rows = [];

    for (let y = 0; y < sideLength; y++) {
      const row = document.createElement("tr");
      const cells = [];
      for (let x = 0; x < sideLength; x++) {
        const cell = document.createElement("td");

        cell.setAttribute("data-cell-x", x);
        cell.setAttribute("data-cell-y", y);
        cell.addEventListener("click", onBoardCellPressed);

        cells.push(cell);
        row.appendChild(cell);
      }
      rows.push(cells);
      table.appendChild(row);
    }

    boardContainer.appendChild(table);
  }

  const selectedValue = selectedCell
    ? board[instance.exports.get_board_index(...selectedCell.toArray())]
    : null;

  let selectedSubgridX, selectedSubgridY;
  if (selectedCell) {
    selectedSubgridX = Math.floor(selectedCell.x / 3);
    selectedSubgridY = Math.floor(selectedCell.y / 3);
  }

  for (let y = 0; y < sideLength; y++) {
    for (let x = 0; x < sideLength; x++) {
      const index = instance.exports.get_board_index(x, y);
      const cell = rows[y][x];

      cell.textContent = board[index];
      cell.classList.remove(
        "highlight-row",
        "highlight-col",
        "highlight-num",
        "highlight-subgrid",
        "empty-cell",
      );

      if (cell.textContent === "0") {
        cell.classList.add("empty-cell");
      }

      if (!selectedCell) {
        continue;
      }

      const rowSelected = selectedCell.x == x;
      const colSelected = selectedCell.y == y;

      cell.setAttribute(
        "aria-selected",
        rowSelected && colSelected ? "true" : "false",
      );

      if (rowSelected) {
        cell.classList.add("highlight-row");
      }

      if (colSelected) {
        cell.classList.add("highlight-col");
      }

      if (
        Math.floor(x / 3) === selectedSubgridX &&
        Math.floor(y / 3) === selectedSubgridY
      ) {
        cell.classList.add("highlight-subgrid");
      }

      if (selectedValue && selectedValue == cell.textContent) {
        cell.classList.add("highlight-num");
      }
    }
  }
}

function onCellKeyboardItemPressed(e) {
  if (!selectedCell) return;

  instance.exports.set_board_value(
    new Number(e.target.innerText),
    ...selectedCell.toArray(),
  );

  board = getBoard();
  drawBoard(board);
}

function onSolveButtonPressed() {
  if (!instance.exports.solve_sudoku()) {
    console.error("Failed to solve Sudoku");
    return;
  }

  board = getSolvedBoard();
  drawBoard(board);
  console.log("Sudoku solved.");
}

function setupKeyboard() {
  keyboard
    .querySelectorAll("span")
    .forEach((btn) => btn.addEventListener("click", onCellKeyboardItemPressed));
}

function drawTestBoard() {
  const b = [
    [5, 3, 0, 0, 7, 0, 0, 0, 0],
    [6, 0, 0, 1, 9, 5, 0, 0, 0],
    [0, 9, 8, 0, 0, 0, 0, 6, 0],
    [8, 0, 0, 0, 6, 0, 0, 0, 3],
    [4, 0, 0, 8, 0, 3, 0, 0, 1],
    [7, 0, 0, 0, 2, 0, 0, 0, 6],
    [0, 6, 0, 0, 0, 0, 2, 8, 0],
    [0, 0, 0, 4, 1, 9, 0, 0, 5],
    [0, 0, 0, 0, 8, 0, 0, 7, 9],
  ];

  for (let y = 0; y < 9; ++y) {
    for (let x = 0; x < 9; ++x) {
      instance.exports.set_board_value(b[y][x], x, y);
    }
  }
}

(() => {
  instance.exports.setup(Date.now());
  setupKeyboard();

  drawTestBoard();

  board = getBoard();
  drawBoard(board);

  solveButton.addEventListener("click", onSolveButtonPressed);
})();

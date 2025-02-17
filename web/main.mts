interface WasmExports {
  memory: WebAssembly.Memory;
  setup: (seed: number) => void;
  solve_sudoku: () => boolean;
  get_board: () => number;
  get_board_size: () => number;
  get_solved_board: () => number;
  get_board_side_length: () => number;
  get_board_index: (x: number, y: number) => number;
  set_board_value: (v: number, x: number, y: number) => boolean;
}

class Cell {
  constructor(
    public x: number,
    public y: number,
  ) {}

  toArray(): [number, number] {
    return [this.x, this.y];
  }
}

const boardContainer = document.getElementById("board") as HTMLDivElement;
const keyboard = document.getElementById("keyboard") as HTMLDivElement;
const solveButton = document.getElementById(
  "solve-button",
) as HTMLButtonElement;
const decoder = new TextDecoder("utf-8");

let table: HTMLTableElement | null = null;
let rows: HTMLTableCellElement[][] = [];
let board: Uint8Array = new Uint8Array();
let sideLength: number = 0;
let selectedCell: Cell = new Cell(-1, -1);

const { instance } = await WebAssembly.instantiateStreaming(
  fetch("./main.wasm"),
  {
    env: {
      console_log: (ptr: number, len: number) =>
        console.log(getString(ptr, len)),
      console_info: (ptr: number, len: number) =>
        console.info(getString(ptr, len)),
      console_error: (ptr: number, len: number) =>
        console.error(getString(ptr, len)),
      console_warn: (ptr: number, len: number) =>
        console.warn(getString(ptr, len)),
    },
  },
);

const exports = instance.exports as unknown as WasmExports;

function getString(ptr: number, len: number): string {
  const bytes = new Uint8Array(exports.memory.buffer, ptr, len);
  return decoder.decode(bytes);
}

function getBoardData(getBoardFunc: Function): Uint8Array {
  return new Uint8Array(
    exports.memory.buffer,
    getBoardFunc(),
    exports.get_board_size(),
  );
}

const getBoard = (): Uint8Array => getBoardData(exports.get_board);
const getSolvedBoard = (): Uint8Array => getBoardData(exports.get_solved_board);

function onBoardCellPressed(e: MouseEvent): void {
  const td = e.target as HTMLTableCellElement;
  const x = +td.getAttribute("data-cell-x")!;
  const y = +td.getAttribute("data-cell-y")!;

  selectedCell = new Cell(x, y);
  drawBoard(board);
}

function onCellKeyboardItemPressed(e: MouseEvent): void {
  if (!selectedCell) return;

  exports.set_board_value(
    +(e.target as HTMLSpanElement).innerText!,
    ...selectedCell.toArray(),
  );

  board = getBoard();
  drawBoard(board);
}

function onSolveButtonPressed(): void {
  if (!exports.solve_sudoku()) {
    console.error("Failed to solve Sudoku");
    return;
  }

  board = getSolvedBoard();
  drawBoard(board);
  console.log("Sudoku solved.");
}

function drawBoard(board: Uint8Array): void {
  sideLength = sideLength || exports.get_board_side_length();
  if (!table) {
    createTable();
  }

  const selectedValue = selectedCell
    ? board[exports.get_board_index(...selectedCell.toArray())]
    : null;

  const selectedSubgridX = selectedCell ? Math.floor(selectedCell.x / 3) : -1;
  const selectedSubgridY = selectedCell ? Math.floor(selectedCell.y / 3) : -1;

  for (let y = 0; y < sideLength; ++y) {
    for (let x = 0; x < sideLength; ++x) {
      const index = exports.get_board_index(x, y);
      const cell = rows[y][x];
      cell.textContent = board[index].toString();
      updateCellClasses(
        cell,
        x,
        y,
        selectedValue,
        selectedSubgridX,
        selectedSubgridY,
      );
    }
  }
}

function createTable(): void {
  table = document.createElement("table");
  rows = [];

  for (let y = 0; y < sideLength; y++) {
    const row = document.createElement("tr");
    const cells = [];

    for (let x = 0; x < sideLength; x++) {
      const cell = document.createElement("td");
      cell.setAttribute("data-cell-x", x.toString());
      cell.setAttribute("data-cell-y", y.toString());
      cell.addEventListener("click", onBoardCellPressed);
      cells.push(cell);
      row.appendChild(cell);
    }

    rows.push(cells);
    table.appendChild(row);
  }

  boardContainer.appendChild(table);
}

function updateCellClasses(
  cell: HTMLTableCellElement,
  x: number,
  y: number,
  selectedValue: number | null,
  selectedSubgridX: number,
  selectedSubgridY: number,
): void {
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

  if (!selectedCell) return;

  const rowSelected = selectedCell.x === x;
  const colSelected = selectedCell.y === y;
  cell.setAttribute(
    "aria-selected",
    rowSelected && colSelected ? "true" : "false",
  );

  if (rowSelected) cell.classList.add("highlight-row");
  if (colSelected) cell.classList.add("highlight-col");

  if (
    Math.floor(x / 3) === selectedSubgridX &&
    Math.floor(y / 3) === selectedSubgridY
  ) {
    cell.classList.add("highlight-subgrid");
  }

  if (selectedValue && selectedValue.toString() === cell.textContent) {
    cell.classList.add("highlight-num");
  }
}

function setupKeyboard(): void {
  keyboard
    .querySelectorAll("span")
    .forEach((btn) => btn.addEventListener("click", onCellKeyboardItemPressed));
}

function drawTestBoard(): void {
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
      exports.set_board_value(b[y][x], x, y);
    }
  }
}

(function initialize(): void {
  exports.setup(Date.now());
  setupKeyboard();

  drawTestBoard();

  board = getBoard();
  drawBoard(board);

  solveButton.addEventListener("click", onSolveButtonPressed);
})();

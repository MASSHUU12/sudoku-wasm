import { printElement } from "./print.mjs";
import { Wasm } from "./wasm.mjs";

interface WasmExports {
  memory: WebAssembly.Memory;
  setup: (seed: number) => void;
  solve_sudoku: () => boolean;
  get_board: () => number;
  get_board_size: () => number;
  get_solved_board: () => number;
  get_board_side_length: () => number;
  get_board_value: (x: number, y: number) => number;
  get_board_index: (x: number, y: number) => number;
  set_board_value: (
    v: number,
    x: number,
    y: number,
    prefilled: boolean,
  ) => boolean;
  fill_test_board: () => void;
  fill_random_board: () => void;
  is_correct_attempt: (v: number, x: number, y: number) => boolean;
  is_board_solved: () => boolean;
}

class Cell {
  constructor(
    public x: number,
    public y: number,
    public num: number,
    public prefilled: boolean,
    public incorrect: boolean,
  ) {}

  static invalid(): Cell {
    return new Cell(-1, -1, -1, false, false);
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }
}

const wasm = new Wasm<WebAssembly.Exports & WasmExports>("./main.wasm");
const boardContainer = document.getElementById("board") as HTMLDivElement;
const keyboard = document.getElementById("keyboard") as HTMLDivElement;
const solveButton = document.getElementById(
  "solve-button",
) as HTMLButtonElement;
const randomButton = document.getElementById(
  "random-button",
) as HTMLButtonElement;
const printButton = document.getElementById(
  "print-button",
) as HTMLButtonElement;
const resetButton = document.getElementById(
  "reset-button",
) as HTMLButtonElement;

let table: HTMLTableElement | null = null;
let rows: HTMLTableCellElement[][] = [];
let board: Cell[] = [];
let sideLength: number = 0;
let selectedCell: Cell = Cell.invalid();
let isBoardLocked = false;

function lockTheBoard(): void {
  isBoardLocked = true;
  selectedCell = Cell.invalid();
}

function getBoardData(getBoardFunc: Function): Cell[] {
  const cells = new Uint32Array(
    wasm.memory!.buffer,
    getBoardFunc(),
    wasm.exports!.get_board_size(),
  );

  let newBoard: Cell[] = [];

  for (let cell of cells) {
    const x = (cell >> (8 * 0)) & 0xff;
    const y = (cell >> (8 * 1)) & 0xff;
    const num = (cell >> (8 * 2)) & 0xff;
    const prefilled = (cell >> (8 * 3)) & 0xff;

    newBoard.push(new Cell(x, y, num, !!prefilled, false));
  }

  return newBoard;
}

const getBoard = (): Cell[] => getBoardData(wasm.exports!.get_board);
const getSolvedBoard = (): Cell[] =>
  getBoardData(wasm.exports!.get_solved_board);

function onBoardCellPressed(e: MouseEvent): void {
  if (isBoardLocked) return;

  const td = e.target as HTMLTableCellElement;
  const x = +td.getAttribute("data-cell-x")!;
  const y = +td.getAttribute("data-cell-y")!;
  const prefilled: boolean = !!+td.getAttribute("data-cell-prefilled")!;
  const incorrect: boolean = td.classList.contains("incorrect-cell");

  selectedCell = board[wasm.exports!.get_board_index(x, y)];
  selectedCell.prefilled = prefilled;
  selectedCell.incorrect = incorrect;
  drawBoard(board);
}

function onCellKeyboardItemPressed(e: MouseEvent): void {
  if (selectedCell.prefilled || isBoardLocked) return;

  const value: number = +(e.target as HTMLSpanElement).innerText!;
  const [x, y] = selectedCell.toArray();

  wasm.exports!.set_board_value(value, x, y, false);
  board = getBoard();

  selectedCell = board[wasm.exports!.get_board_index(x, y)];
  if (selectedCell.num !== 0) {
    selectedCell.incorrect = !wasm.exports!.is_correct_attempt(value, x, y);

    if (wasm.exports!.is_board_solved()) {
      lockTheBoard();
      console.log("Solved");
    }
  }

  drawBoard(board);
}

function onSolveButtonPressed(): void {
  if (!wasm.exports!.solve_sudoku()) {
    console.error("Failed to solve Sudoku");
    return;
  }

  board = getSolvedBoard();
  drawBoard(board);
  lockTheBoard();
  console.log("Sudoku solved.");
}

function onRandomButtonPressed(): void {
  isBoardLocked = false;
  wasm.exports!.fill_random_board();

  board = getBoard();
  drawBoard(board);
  console.log("Created new board.");
}

function onResetButtonPressed(): void {
  board.forEach((c: Cell): void => {
    if (!c.prefilled) {
      c.num = 0;
      c.incorrect = false;
      wasm.exports!.set_board_value(c.num, c.x, c.y, false);
    }
  });

  drawBoard(board);
}

function drawBoard(board: Cell[]): void {
  sideLength = sideLength || wasm.exports!.get_board_side_length();
  if (!table) {
    createTable();
  }

  const selectedSubgridX = Math.floor(selectedCell.x / 3);
  const selectedSubgridY = Math.floor(selectedCell.y / 3);

  for (let y = 0; y < sideLength; ++y) {
    for (let x = 0; x < sideLength; ++x) {
      const index = wasm.exports!.get_board_index(x, y);
      const cellItem = rows[y][x];
      const cell: Cell = board[wasm.exports!.get_board_index(x, y)];

      cellItem.textContent = board[index].num.toString();
      cellItem.setAttribute("data-cell-prefilled", cell.prefilled ? "1" : "0");

      updateCellClasses(
        cellItem,
        x,
        y,
        selectedCell.num,
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
      const cellItem = document.createElement("td");
      cellItem.setAttribute("data-cell-x", x.toString());
      cellItem.setAttribute("data-cell-y", y.toString());
      cellItem.addEventListener("click", onBoardCellPressed);
      cells.push(cellItem);
      row.appendChild(cellItem);
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
  selectedValue: number,
  selectedSubgridX: number,
  selectedSubgridY: number,
): void {
  cell.classList.remove(
    "highlight-row",
    "highlight-col",
    "highlight-num",
    "highlight-subgrid",
    "empty-cell",
    "incorrect-cell",
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

  if (
    selectedValue.toString() === cell.textContent &&
    cell.textContent !== "0"
  ) {
    cell.classList.add("highlight-num");
  }

  if (board[wasm.exports!.get_board_index(x, y)].incorrect) {
    cell.classList.add("incorrect-cell");
  }
}

function setupKeyboard(): void {
  keyboard
    .querySelectorAll("button")
    .forEach((btn) => btn.addEventListener("click", onCellKeyboardItemPressed));
}

(async function initialize(): Promise<void> {
  await wasm.init();
  wasm.exports!.setup(Date.now());
  setupKeyboard();

  // wasm.exports!.fill_random_board();
  wasm.exports!.fill_test_board();
  wasm.exports!.solve_sudoku();

  board = getBoard();
  drawBoard(board);

  resetButton.addEventListener("click", onResetButtonPressed);
  solveButton.addEventListener("click", onSolveButtonPressed);
  randomButton.addEventListener("click", onRandomButtonPressed);
  printButton.addEventListener("click", () => printElement(boardContainer));
})();

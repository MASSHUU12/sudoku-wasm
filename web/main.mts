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

const boardContainer = document.getElementById("board") as HTMLDivElement;
const keyboard = document.getElementById("keyboard") as HTMLDivElement;
const solveButton = document.getElementById(
  "solve-button",
) as HTMLButtonElement;
const decoder = new TextDecoder("utf-8");

let table: HTMLTableElement | null = null;
let rows: HTMLTableCellElement[][] = [];
let board: Cell[] = [];
let sideLength: number = 0;
let selectedCell: Cell = Cell.invalid();

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

function getBoardData(getBoardFunc: Function): Cell[] {
  const cells = new Uint32Array(
    exports.memory.buffer,
    getBoardFunc(),
    exports.get_board_size(),
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

const getBoard = (): Cell[] => getBoardData(exports.get_board);
const getSolvedBoard = (): Cell[] => getBoardData(exports.get_solved_board);

function onBoardCellPressed(e: MouseEvent): void {
  const td = e.target as HTMLTableCellElement;
  const x = +td.getAttribute("data-cell-x")!;
  const y = +td.getAttribute("data-cell-y")!;
  const prefilled: boolean = !!+td.getAttribute("data-cell-prefilled")!;
  const incorrect: boolean = td.classList.contains("incorrect-cell");

  selectedCell = board[exports.get_board_index(x, y)];
  selectedCell.prefilled = prefilled;
  selectedCell.incorrect = incorrect;
  drawBoard(board);
}

function onCellKeyboardItemPressed(e: MouseEvent): void {
  if (selectedCell.prefilled) return;

  const value: number = +(e.target as HTMLSpanElement).innerText!;
  const [x, y] = selectedCell.toArray();

  exports.set_board_value(value, x, y, false);
  board = getBoard();

  selectedCell = board[exports.get_board_index(x, y)];
  if (selectedCell.num !== 0) {
    selectedCell.incorrect = !exports.is_correct_attempt(value, x, y);
  }

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

function drawBoard(board: Cell[]): void {
  sideLength = sideLength || exports.get_board_side_length();
  if (!table) {
    createTable();
  }

  const selectedSubgridX = Math.floor(selectedCell.x / 3);
  const selectedSubgridY = Math.floor(selectedCell.y / 3);

  for (let y = 0; y < sideLength; ++y) {
    for (let x = 0; x < sideLength; ++x) {
      const index = exports.get_board_index(x, y);
      const cell = rows[y][x];
      cell.textContent = board[index].num.toString();
      updateCellClasses(
        cell,
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
      const cell: Cell = board[exports.get_board_index(x, y)];
      cellItem.setAttribute("data-cell-x", x.toString());
      cellItem.setAttribute("data-cell-y", y.toString());
      cellItem.setAttribute("data-cell-prefilled", cell.prefilled ? "1" : "0");
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

  if (board[exports.get_board_index(x, y)].incorrect) {
    cell.classList.add("incorrect-cell");
  }
}

function setupKeyboard(): void {
  keyboard
    .querySelectorAll("span")
    .forEach((btn) => btn.addEventListener("click", onCellKeyboardItemPressed));
}

(function initialize(): void {
  exports.setup(Date.now());
  setupKeyboard();

  exports.fill_random_board();
  exports.solve_sudoku();

  board = getBoard();
  drawBoard(board);

  solveButton.addEventListener("click", onSolveButtonPressed);
})();

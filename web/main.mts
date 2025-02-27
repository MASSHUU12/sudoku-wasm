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
  private static invalidCell = new Cell(
    -1,
    -1,
    -1,
    false,
    false,
    new Array<boolean>(9).fill(false),
  );

  constructor(
    public x: number,
    public y: number,
    public num: number,
    public prefilled: boolean,
    public incorrect: boolean,
    public notes: boolean[],
  ) {}

  static invalid(): Cell {
    return this.invalidCell;
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  resetNotes(): void {
    this.notes.fill(false);
  }
}

class SudokuBoard {
  private wasm: Wasm<WebAssembly.Exports & WasmExports>;
  private boardContainer: HTMLDivElement;
  private keyboard: HTMLDivElement;
  private solveButton: HTMLButtonElement;
  private randomButton: HTMLButtonElement;
  private printButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;
  private notesButton: HTMLButtonElement;
  private table: HTMLTableElement | null = null;
  private rows: HTMLTableCellElement[][] = [];
  private board: Cell[] = [];
  private sideLength: number = 0;
  private selectedCell: Cell = Cell.invalid();
  private isBoardLocked = false;
  private notesMode = false;

  constructor(wasmUrl: string) {
    this.wasm = new Wasm<WebAssembly.Exports & WasmExports>(wasmUrl);
    this.boardContainer = document.getElementById("board") as HTMLDivElement;
    this.keyboard = document.getElementById("keyboard") as HTMLDivElement;
    this.solveButton = document.getElementById(
      "solve-button",
    ) as HTMLButtonElement;
    this.randomButton = document.getElementById(
      "random-button",
    ) as HTMLButtonElement;
    this.printButton = document.getElementById(
      "print-button",
    ) as HTMLButtonElement;
    this.resetButton = document.getElementById(
      "reset-button",
    ) as HTMLButtonElement;
    this.notesButton = document.getElementById(
      "notes-button",
    ) as HTMLButtonElement;

    this.setupEventListeners();
    this.initialize();
  }

  private setupEventListeners(): void {
    this.resetButton.addEventListener(
      "click",
      this.onResetButtonPressed.bind(this),
    );
    this.solveButton.addEventListener(
      "click",
      this.onSolveButtonPressed.bind(this),
    );
    this.randomButton.addEventListener(
      "click",
      this.onRandomButtonPressed.bind(this),
    );
    this.printButton.addEventListener("click", () =>
      printElement(this.boardContainer),
    );
    this.keyboard
      .querySelectorAll("button")
      .forEach((btn) =>
        btn.addEventListener(
          "click",
          this.onCellKeyboardItemPressed.bind(this),
        ),
      );
    this.notesButton.addEventListener(
      "click",
      this.onNotesButtonPressed.bind(this),
    );
  }

  private async initialize(): Promise<void> {
    await this.wasm.init();
    this.wasm.exports!.setup(Date.now());

    // this.wasm.exports!.fill_random_board();
    this.wasm.exports!.fill_test_board();
    this.wasm.exports!.solve_sudoku();

    this.board = this.getBoard();
    this.drawBoard();
  }

  private lockTheBoard(): void {
    this.isBoardLocked = true;
    this.selectedCell = Cell.invalid();
  }

  private getBoardData(getBoardFunc: Function): Cell[] {
    const cells = new Uint32Array(
      this.wasm.memory!.buffer,
      getBoardFunc(),
      this.wasm.exports!.get_board_size(),
    );
    const newBoard: Cell[] = [];

    for (let cell of cells) {
      const x = (cell >> (8 * 0)) & 0xff;
      const y = (cell >> (8 * 1)) & 0xff;
      const num = (cell >> (8 * 2)) & 0xff;
      const prefilled = (cell >> (8 * 3)) & 0xff;

      newBoard.push(
        new Cell(
          x,
          y,
          num,
          !!prefilled,
          false,
          new Array<boolean>(9).fill(false),
        ),
      );
    }

    return newBoard;
  }

  private getBoard(): Cell[] {
    return this.getBoardData(this.wasm.exports!.get_board);
  }

  private getSolvedBoard(): Cell[] {
    return this.getBoardData(this.wasm.exports!.get_solved_board);
  }

  private onBoardCellPressed(e: MouseEvent): void {
    if (this.isBoardLocked) return;

    const td = (e.target as HTMLElement).closest("td");
    if (!td) return;
    const x = +td.getAttribute("data-cell-x")!;
    const y = +td.getAttribute("data-cell-y")!;
    const prefilled: boolean = !!+td.getAttribute("data-cell-prefilled")!;
    const incorrect: boolean = td.classList.contains("incorrect-cell");

    // if (prefilled) return;

    this.selectedCell = this.board[this.wasm.exports!.get_board_index(x, y)];
    this.selectedCell.prefilled = prefilled;
    this.selectedCell.incorrect = incorrect;

    this.drawBoard();
  }

  private onCellKeyboardItemPressed(e: MouseEvent): void {
    if (this.selectedCell.prefilled || this.isBoardLocked) return;

    const value: number = +(e.target as HTMLSpanElement).innerText!;

    if (this.notesMode) {
      this.selectedCell.notes[value - 1] = !this.selectedCell.notes[value - 1];
    } else {
      const [x, y] = this.selectedCell.toArray();

      this.wasm.exports!.set_board_value(value, x, y, false);

      this.selectedCell = this.board[this.wasm.exports!.get_board_index(x, y)];
      this.selectedCell.num = value;

      if (this.selectedCell.num !== 0) {
        this.selectedCell.incorrect = !this.wasm.exports!.is_correct_attempt(
          value,
          x,
          y,
        );

        if (!this.selectedCell.incorrect) {
          this.selectedCell.resetNotes();
        }

        if (this.wasm.exports!.is_board_solved()) {
          this.lockTheBoard();
          console.log("Solved");
        }
      }
    }

    this.drawBoard();
  }

  private onSolveButtonPressed(): void {
    if (!this.wasm.exports!.solve_sudoku()) {
      console.error("Failed to solve Sudoku");
      return;
    }

    this.board = this.getSolvedBoard();
    this.drawBoard();
    this.lockTheBoard();
    console.log("Sudoku solved");
  }

  private onRandomButtonPressed(): void {
    this.isBoardLocked = false;
    this.wasm.exports!.fill_random_board();

    this.board = this.getBoard();
    this.drawBoard();
    console.log("Created new board");
  }

  private onResetButtonPressed(): void {
    this.board.forEach((c: Cell): void => {
      if (!c.prefilled) {
        c.num = 0;
        c.incorrect = false;
        c.notes = c.notes.fill(false);
        this.wasm.exports!.set_board_value(c.num, c.x, c.y, false);
      }
    });

    this.drawBoard();
  }

  private onNotesButtonPressed(e: MouseEvent): void {
    const target = e.target as HTMLButtonElement;

    this.notesMode = !this.notesMode;
    target.innerText = `Notes: ${this.notesMode ? "ON" : "OFF"}`;
  }

  private drawBoard(): void {
    this.sideLength =
      this.sideLength || this.wasm.exports!.get_board_side_length();
    if (!this.table) {
      this.createTable();
    }

    const selectedSubgridX = Math.floor(this.selectedCell.x / 3);
    const selectedSubgridY = Math.floor(this.selectedCell.y / 3);

    for (let y = 0; y < this.sideLength; ++y) {
      for (let x = 0; x < this.sideLength; ++x) {
        const index = this.wasm.exports!.get_board_index(x, y);
        const cellItem: HTMLTableCellElement = this.rows[y][x];

        const cell: Cell = this.board[this.wasm.exports!.get_board_index(x, y)];

        const textItem: HTMLSpanElement | null = cellItem.querySelector("span");

        if (textItem === null) {
          throw new Error(`Span of the [${x}, ${y}] cell is unavailable.`);
        }

        textItem.textContent = this.board[index].num.toString();
        cellItem.setAttribute(
          "data-cell-prefilled",
          cell.prefilled ? "1" : "0",
        );

        this.updateCellClasses(
          cellItem,
          x,
          y,
          this.selectedCell.num,
          selectedSubgridX,
          selectedSubgridY,
        );
      }
    }
  }

  private createTable(): void {
    this.table = document.createElement("table");
    this.rows = [];

    for (let y = 0; y < this.sideLength; ++y) {
      const row = document.createElement("tr");
      const cells: HTMLTableCellElement[] = [];

      for (let x = 0; x < this.sideLength; ++x) {
        const cellItem = document.createElement("td");
        const textItem = document.createElement("span");
        const innerGrid = document.createElement("div");

        innerGrid.classList.add("inner-grid");
        cellItem.append(textItem, innerGrid);

        const hintFragment = document.createDocumentFragment();
        for (let i = 1; i <= 9; ++i) {
          const hintItem = document.createElement("div");
          hintItem.textContent = i.toString();
          hintFragment.appendChild(hintItem);
        }
        innerGrid.appendChild(hintFragment);

        cellItem.setAttribute("data-cell-x", x.toString());
        cellItem.setAttribute("data-cell-y", y.toString());
        cellItem.addEventListener("click", this.onBoardCellPressed.bind(this));
        cells.push(cellItem);
        row.appendChild(cellItem);
      }

      this.rows.push(cells);
      this.table.appendChild(row);
    }

    this.boardContainer.appendChild(this.table);
  }

  private updateCellClasses(
    cellItem: HTMLTableCellElement,
    x: number,
    y: number,
    selectedValue: number,
    selectedSubgridX: number,
    selectedSubgridY: number,
  ): void {
    const cell: Cell = this.board[this.wasm.exports!.get_board_index(x, y)];

    cellItem.classList.remove(
      "highlight-row",
      "highlight-col",
      "highlight-num",
      "highlight-subgrid",
      "empty-cell",
      "incorrect-cell",
    );

    const innerGrid = cellItem.querySelector("div");
    if (!innerGrid) {
      throw new Error(`Inner grid of the [${x}, ${y}] cell is unavailable.`);
    }

    innerGrid
      .querySelectorAll("div")
      .forEach((noteItem: HTMLDivElement): void => {
        const value: number = +noteItem.innerText;

        if (cell.notes[value - 1]) {
          noteItem.classList.add("note-visible");
        } else {
          noteItem.classList.remove("note-visible");
        }
      });

    const textItem: HTMLSpanElement | null = cellItem.querySelector("span");
    if (!textItem) {
      throw new Error(`Span of the [${x}, ${y}] cell is unavailable.`);
    }

    if (textItem.textContent === "0") {
      cellItem.classList.add("empty-cell");
    }

    if (!this.selectedCell) return;

    const rowSelected = this.selectedCell.x === x;
    const colSelected = this.selectedCell.y === y;
    cellItem.setAttribute(
      "aria-selected",
      rowSelected && colSelected ? "true" : "false",
    );

    if (rowSelected) cellItem.classList.add("highlight-row");
    if (colSelected) cellItem.classList.add("highlight-col");

    if (
      Math.floor(x / 3) === selectedSubgridX &&
      Math.floor(y / 3) === selectedSubgridY
    ) {
      cellItem.classList.add("highlight-subgrid");
    }

    if (
      selectedValue.toString() === textItem.textContent &&
      textItem.textContent !== "0"
    ) {
      cellItem.classList.add("highlight-num");
    }

    if (cell.incorrect) {
      cellItem.classList.add("incorrect-cell");
    }
  }
}

(function initialize(): void {
  new SudokuBoard("./main.wasm");
})();

import { Cell } from "./Cell.mjs";
import { WasmInterface } from "./WasmInterface.mjs";
import { SudokuUI } from "./SudokuUI.mjs";
import { GameState } from "./types.mjs";

export class SudokuBoard {
  public wasmInterface: WasmInterface;
  private ui: SudokuUI;
  private board: Cell[] = [];
  private selectedCell: Cell = Cell.invalid();
  private gameState: GameState = GameState.INITIALIZING;
  private notesMode = false;

  constructor(wasmUrl: string, ui: SudokuUI) {
    this.wasmInterface = new WasmInterface(wasmUrl);
    this.ui = ui;
    this.ui.setWasmInterface(this.wasmInterface);
  }

  async initialize(): Promise<void> {
    await this.wasmInterface.init();

    const cellElements = this.ui.createTable(
      this.wasmInterface.boardSideLength,
    );

    // Initialize the board with a random puzzle
    this.wasmInterface.fillRandomBoard();
    this.board = this.wasmInterface.getBoard(cellElements);
    this.gameState = GameState.PLAYING;

    this.ui.drawBoard(this.board);
  }

  selectCell(x: number, y: number): void {
    if (this.gameState === GameState.LOCKED) return;

    const index = this.wasmInterface.getBoardIndex(x, y);
    this.selectedCell = this.board[index];

    this.ui.drawBoard(this.board, this.selectedCell);
  }

  handleInput(value: number): void {
    if (
      this.gameState === GameState.LOCKED ||
      this.selectedCell === Cell.invalid() ||
      this.selectedCell.prefilled
    ) {
      return;
    }

    const [x, y] = this.selectedCell.toArray();

    if (this.notesMode) {
      this.handleNotesInput(value);
    } else {
      this.handleNumberInput(value, x, y);
    }

    this.ui.drawBoard(this.board, this.selectedCell);
  }

  private handleNotesInput(value: number): void {
    if (this.selectedCell.num === 0 && value > 0 && value <= 9) {
      this.wasmInterface.toggleCellNote(
        value - 1,
        ...this.selectedCell.toArray(),
      );
    }
  }

  private handleNumberInput(value: number, x: number, y: number): void {
    this.wasmInterface.setBoardValue(value, x, y, false);

    // Update cell state
    this.selectedCell = this.board[this.wasmInterface.getBoardIndex(x, y)];
    this.selectedCell.num = value;

    if (value === 0) {
      this.selectedCell.incorrect = false;
    } else {
      this.selectedCell.incorrect = !this.wasmInterface.isCorrectAttempt(
        value,
        x,
        y,
      );
      this.wasmInterface.resetCellNotes(...this.selectedCell.toArray());

      // Check if the board is solved
      if (this.wasmInterface.isBoardSolved()) {
        this.gameState = GameState.SOLVED;
        this.selectedCell = Cell.invalid();
        console.log("Solved");
      }
    }
  }

  solveBoard(): void {
    if (!this.wasmInterface.solveSudoku()) {
      console.error("Failed to solve Sudoku");
      return;
    }

    this.board = this.wasmInterface.getSolvedBoard(this.ui.cellElements);
    this.gameState = GameState.LOCKED;
    this.selectedCell = Cell.invalid();

    this.ui.drawBoard(this.board);
    console.log("Sudoku solved");
  }

  randomizeBoard(): void {
    this.gameState = GameState.PLAYING;
    this.wasmInterface.fillRandomBoard();
    this.board = this.wasmInterface.getBoard(this.ui.cellElements);

    this.ui.drawBoard(this.board);
    console.log("Created new board");
  }

  resetBoard(): void {
    this.board.forEach((cell: Cell): void => {
      if (!cell.prefilled) {
        cell.num = 0;
        cell.incorrect = false;
        this.wasmInterface.resetCellNotes(...cell.toArray());
        this.wasmInterface.setBoardValue(cell.num, cell.x, cell.y, false);
      }
    });

    this.ui.drawBoard(this.board, this.selectedCell);
  }

  toggleNotesMode(): void {
    this.notesMode = !this.notesMode;
    this.ui.setNotesButtonText(this.notesMode);
  }

  printBoard(): void {
    this.ui.printBoard();
  }
}

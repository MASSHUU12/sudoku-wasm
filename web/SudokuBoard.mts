import { Cell } from "./Cell.mjs";
import { WasmInterface } from "./WasmInterface.mjs";
import { SudokuUI } from "./SudokuUI.mjs";
import { GameState } from "./types.mjs";
import { EventEmitter } from "./EventEmitter.mjs";

export class SudokuBoard {
  public wasmInterface: WasmInterface;
  private ui: SudokuUI;
  private board: Cell[] = [];
  private selectedCell: Cell = Cell.invalid();
  private gameState: GameState = GameState.INITIALIZING;
  private notesMode = false;
  private eventEmitter = new EventEmitter();

  constructor(wasmUrl: string, ui: SudokuUI) {
    this.wasmInterface = new WasmInterface(wasmUrl);
    this.ui = ui;
    this.ui.setWasmInterface(this.wasmInterface);
  }

  public on(event: string, callback: (...args: any[]) => void): void {
    this.eventEmitter.on(event, callback);
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
    this.eventEmitter.emit("gameStateChanged", this.gameState);

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
    if (!this.wasmInterface.setBoardValue(value, x, y, false)) {
      return;
    }

    // Update cell state
    this.selectedCell = this.board[this.wasmInterface.getBoardIndex(x, y)];
    this.selectedCell.num = value;
    this.wasmInterface.cleanupInvalidNotes(x, y);

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
        const previousState = this.gameState;
        this.gameState = GameState.SOLVED;
        this.eventEmitter.emit(
          "gameStateChanged",
          this.gameState,
          previousState,
        );
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

    const previousState = this.gameState;
    this.board = this.wasmInterface.getSolvedBoard(this.ui.cellElements);
    this.gameState = GameState.LOCKED;
    this.eventEmitter.emit("gameStateChanged", this.gameState, previousState);
    this.selectedCell = Cell.invalid();

    this.ui.drawBoard(this.board);
    console.log("Sudoku solved");
  }

  randomizeBoard(): void {
    const previousState = this.gameState;
    this.gameState = GameState.PLAYING;
    this.eventEmitter.emit("gameStateChanged", this.gameState, previousState);
    this.wasmInterface.fillRandomBoard();
    this.board = this.wasmInterface.getBoard(this.ui.cellElements);

    this.ui.drawBoard(this.board);
    console.log("Created new board");
  }

  resetBoard(): void {
    this.wasmInterface.resetBoard();

    const newBoard = this.wasmInterface.getBoard();
    for (let i = 0; i < this.board.length; ++i) {
      const { x, y, num, prefilled } = newBoard[i];
      this.board[i] = new Cell(x, y, num, prefilled, this.board[i].item);
    }

    const previousState = this.gameState;
    this.gameState = GameState.PLAYING;
    this.eventEmitter.emit("gameStateChanged", this.gameState, previousState);

    this.ui.drawBoard(this.board, Cell.invalid());
  }

  toggleNotesMode(): void {
    this.notesMode = !this.notesMode;
    this.ui.setNotesButtonText(this.notesMode);
  }

  printBoard(): void {
    this.ui.printBoard();
  }
}

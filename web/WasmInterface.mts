import { Wasm } from "./wasm.mjs";
import { Cell } from "./Cell.mjs";
import type { WasmExports } from "./types.mjs";

export class WasmInterface {
  private wasm: Wasm<WebAssembly.Exports & WasmExports>;
  private sideLength: number = 0;

  constructor(wasmUrl: string) {
    this.wasm = new Wasm<WebAssembly.Exports & WasmExports>(wasmUrl);
  }

  async init(): Promise<void> {
    await this.wasm.init();
    this.wasm.exports!.setup(Date.now());
    this.sideLength = this.wasm.exports!.get_board_side_length();
  }

  get exports() {
    return this.wasm.exports;
  }

  get memory() {
    return this.wasm.memory;
  }

  get boardSideLength(): number {
    return this.sideLength;
  }

  getBoardData(
    getBoardFunc: Function,
    cellElements?: HTMLTableCellElement[][],
  ): Cell[] {
    const cells = new BigUint64Array(
      this.wasm.memory!.buffer,
      getBoardFunc(),
      this.wasm.exports!.get_board_size(),
    );

    const newBoard: Cell[] = [];

    for (let cell of cells) {
      const x = Number((cell >> BigInt(8 * 0)) & BigInt(0xff));
      const y = Number((cell >> BigInt(8 * 1)) & BigInt(0xff));
      const num = Number((cell >> BigInt(8 * 2)) & BigInt(0xff));
      const prefilled = Number((cell >> BigInt(8 * 3)) & BigInt(0xff)) !== 0;
      const cellElement = cellElements ? cellElements[y]?.[x] : null;

      newBoard.push(new Cell(x, y, num, prefilled, cellElement));
    }

    return newBoard;
  }

  getBoard(cellElements?: HTMLTableCellElement[][]): Cell[] {
    return this.getBoardData(this.wasm.exports!.get_board, cellElements);
  }

  getSolvedBoard(cellElements?: HTMLTableCellElement[][]): Cell[] {
    return this.getBoardData(this.wasm.exports!.get_solved_board, cellElements);
  }

  isBoardSolved(): boolean {
    return this.wasm.exports!.is_board_solved();
  }

  isCorrectAttempt(value: number, x: number, y: number): boolean {
    return this.wasm.exports!.is_correct_attempt(value, x, y);
  }

  setBoardValue(
    value: number,
    x: number,
    y: number,
    prefilled: boolean,
  ): boolean {
    return this.wasm.exports!.set_board_value(value, x, y, prefilled);
  }

  getBoardIndex(x: number, y: number): number {
    return this.wasm.exports!.get_board_index(x, y);
  }

  resetBoard(): void {
    this.wasm.exports!.reset_board();
  }

  fillRandomBoard(): void {
    this.wasm.exports!.fill_random_board();
  }

  fillTestBoard(): void {
    this.wasm.exports!.fill_test_board();
  }

  solveSudoku(): boolean {
    return this.wasm.exports!.solve_sudoku();
  }

  getCellNote(note: number, x: number, y: number): boolean {
    return this.wasm.exports!.get_cell_note(note, x, y);
  }

  setCellNote(on: boolean, note: number, x: number, y: number): number {
    return this.wasm.exports!.set_cell_note(on, note, x, y);
  }

  toggleCellNote(note: number, x: number, y: number): number {
    return this.wasm.exports!.toggle_cell_note(note, x, y);
  }

  resetCellNotes(x: number, y: number): boolean {
    return this.wasm.exports!.reset_cell_notes(x, y);
  }

  cleanupInvalidNotes(x: number, y: number): void {
    this.wasm.exports!.cleanup_invalid_notes(x, y);
  }
}

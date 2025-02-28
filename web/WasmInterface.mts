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

      const cellElement = cellElements ? cellElements[y]?.[x] : null;
      newBoard.push(new Cell(x, y, num, !!prefilled, cellElement));
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

  fillRandomBoard(): void {
    this.wasm.exports!.fill_random_board();
  }

  fillTestBoard(): void {
    this.wasm.exports!.fill_test_board();
  }

  solveSudoku(): boolean {
    return this.wasm.exports!.solve_sudoku();
  }
}

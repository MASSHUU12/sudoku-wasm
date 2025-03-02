import { Wasm } from "./wasm.mjs";
import { Cell } from "./Cell.mjs";
export class WasmInterface {
    wasm;
    sideLength = 0;
    constructor(wasmUrl) {
        this.wasm = new Wasm(wasmUrl);
    }
    async init() {
        await this.wasm.init();
        this.wasm.exports.setup(Date.now());
        this.sideLength = this.wasm.exports.get_board_side_length();
    }
    get exports() {
        return this.wasm.exports;
    }
    get memory() {
        return this.wasm.memory;
    }
    get boardSideLength() {
        return this.sideLength;
    }
    getBoardData(getBoardFunc, cellElements) {
        const cells = new BigUint64Array(this.wasm.memory.buffer, getBoardFunc(), this.wasm.exports.get_board_size());
        const newBoard = [];
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
    getBoard(cellElements) {
        return this.getBoardData(this.wasm.exports.get_board, cellElements);
    }
    getSolvedBoard(cellElements) {
        return this.getBoardData(this.wasm.exports.get_solved_board, cellElements);
    }
    isBoardSolved() {
        return this.wasm.exports.is_board_solved();
    }
    isCorrectAttempt(value, x, y) {
        return this.wasm.exports.is_correct_attempt(value, x, y);
    }
    setBoardValue(value, x, y, prefilled) {
        return this.wasm.exports.set_board_value(value, x, y, prefilled);
    }
    getBoardIndex(x, y) {
        return this.wasm.exports.get_board_index(x, y);
    }
    resetBoard() {
        this.wasm.exports.reset_board();
    }
    fillRandomBoard() {
        this.wasm.exports.fill_random_board();
    }
    fillTestBoard() {
        this.wasm.exports.fill_test_board();
    }
    solveSudoku() {
        return this.wasm.exports.solve_sudoku();
    }
    getCellNote(note, x, y) {
        return this.wasm.exports.get_cell_note(note, x, y);
    }
    setCellNote(on, note, x, y) {
        return this.wasm.exports.set_cell_note(on, note, x, y);
    }
    toggleCellNote(note, x, y) {
        return this.wasm.exports.toggle_cell_note(note, x, y);
    }
    resetCellNotes(x, y) {
        return this.wasm.exports.reset_cell_notes(x, y);
    }
}
//# sourceMappingURL=WasmInterface.mjs.map
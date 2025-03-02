import { SudokuBoard } from "./SudokuBoard.mjs";
import { SudokuUI } from "./SudokuUI.mjs";
export class SudokuController {
    board;
    ui;
    constructor(wasmUrl) {
        this.ui = new SudokuUI();
        this.board = new SudokuBoard(wasmUrl, this.ui);
        this.setupEventListeners();
    }
    setupEventListeners() {
        this.ui.resetButtonElement.addEventListener("click", () => this.board.resetBoard());
        this.ui.solveButtonElement.addEventListener("click", () => this.board.solveBoard());
        this.ui.randomButtonElement.addEventListener("click", () => this.board.randomizeBoard());
        this.ui.printButtonElement.addEventListener("click", () => this.board.printBoard());
        this.ui.notesButtonElement.addEventListener("click", () => this.board.toggleNotesMode());
        this.ui.keyboardElement.querySelectorAll("button").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                const value = +e.target.innerText;
                this.board.handleInput(value);
            });
        });
        addEventListener("keydown", (e) => {
            if (e.key >= "0" && e.key <= "9") {
                this.board.handleInput(+e.key);
            }
        });
    }
    async initialize() {
        await this.board.initialize();
        this.ui.cellElements.forEach((row, y) => {
            row.forEach((cell, x) => {
                cell.addEventListener("click", () => this.board.selectCell(x, y));
            });
        });
    }
}
//# sourceMappingURL=SudokuController.mjs.map
import { SudokuBoard } from "./SudokuBoard.mjs";
import { SudokuUI } from "./SudokuUI.mjs";
import { GameState } from "./types.mjs";
export class SudokuController {
    board;
    ui;
    timerIntervalId = 0;
    constructor(wasmUrl) {
        this.ui = new SudokuUI();
        this.board = new SudokuBoard(wasmUrl, this.ui);
        this.setupEventListeners();
        this.board.on("gameStateChanged", (newState) => {
            if (newState === GameState.SOLVED) {
                this.stopTimer();
            }
        });
    }
    setupEventListeners() {
        this.ui.resetButtonElement.addEventListener("click", () => {
            this.board.resetBoard();
            this.setupIntervals();
        });
        this.ui.solveButtonElement.addEventListener("click", () => {
            this.board.solveBoard();
            this.stopTimer();
        });
        this.ui.randomButtonElement.addEventListener("click", () => {
            this.board.randomizeBoard();
            this.setupIntervals();
        });
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
    setupIntervals() {
        this.stopTimer();
        this.ui.resetTimer();
        this.timerIntervalId = setInterval(() => this.ui.updateTimer(), 1000);
    }
    stopTimer() {
        if (this.timerIntervalId) {
            clearInterval(this.timerIntervalId);
            this.timerIntervalId = 0;
        }
    }
    async initialize() {
        await this.board.initialize();
        this.ui.cellElements.forEach((row, y) => {
            row.forEach((cell, x) => {
                cell.addEventListener("click", () => this.board.selectCell(x, y));
            });
        });
        this.setupIntervals();
    }
}
//# sourceMappingURL=SudokuController.mjs.map
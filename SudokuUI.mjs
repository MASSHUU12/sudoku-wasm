import { Cell } from "./Cell.mjs";
import { printElement } from "./print.mjs";
export class SudokuUI {
    boardContainer;
    keyboard;
    solveButton;
    randomButton;
    printButton;
    resetButton;
    notesButton;
    table = null;
    rows = [];
    wasmInterface = null;
    constructor() {
        this.boardContainer = document.getElementById("board");
        this.keyboard = document.getElementById("keyboard");
        this.solveButton = document.getElementById("solve-button");
        this.randomButton = document.getElementById("random-button");
        this.printButton = document.getElementById("print-button");
        this.resetButton = document.getElementById("reset-button");
        this.notesButton = document.getElementById("notes-button");
    }
    setWasmInterface(wasmInterface) {
        this.wasmInterface = wasmInterface;
    }
    createTable(sideLength) {
        this.table = document.createElement("table");
        this.rows = [];
        for (let y = 0; y < sideLength; ++y) {
            const row = document.createElement("tr");
            const cells = [];
            for (let x = 0; x < sideLength; ++x) {
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
                cells.push(cellItem);
                row.appendChild(cellItem);
            }
            this.rows.push(cells);
            this.table.appendChild(row);
        }
        this.boardContainer.appendChild(this.table);
        return this.rows;
    }
    updateCellDisplay(cell, selectedCell = null) {
        if (!cell.item || !this.wasmInterface)
            return;
        cell.item.classList.remove("highlight-row", "highlight-col", "highlight-num", "highlight-subgrid", "empty-cell", "incorrect-cell");
        if (!cell.innerGrid || !cell.textItem) {
            console.error(`Cell elements missing for [${cell.x}, ${cell.y}]`);
            return;
        }
        cell.innerGrid
            .querySelectorAll("div")
            .forEach((noteItem) => {
            const value = +noteItem.innerText;
            noteItem.classList.toggle("note-visible", this.wasmInterface.getCellNote(value - 1, ...cell.toArray()));
        });
        if (cell.textItem.textContent === "0") {
            cell.item.classList.add("empty-cell");
        }
        if (!selectedCell)
            return;
        const [x, y] = cell.toArray();
        const rowSelected = selectedCell.x === x;
        const colSelected = selectedCell.y === y;
        cell.item.setAttribute("aria-selected", rowSelected && colSelected ? "true" : "false");
        if (rowSelected)
            cell.item.classList.add("highlight-row");
        if (colSelected)
            cell.item.classList.add("highlight-col");
        const [subX, subY] = cell.subgrid();
        const [selectedSubX, selectedSubY] = selectedCell.subgrid();
        if (subX === selectedSubX && subY === selectedSubY) {
            cell.item.classList.add("highlight-subgrid");
        }
        if (selectedCell.num.toString() === cell.textItem.textContent &&
            cell.textItem.textContent !== "0") {
            cell.item.classList.add("highlight-num");
        }
        if (cell.incorrect) {
            cell.item.classList.add("incorrect-cell");
        }
    }
    drawBoard(board, selectedCell = null) {
        for (const cell of board) {
            if (!cell.textItem) {
                throw new Error(`Span of the [${cell.x}, ${cell.y}] cell is unavailable.`);
            }
            cell.textItem.textContent = cell.num.toString();
            cell.item?.setAttribute("data-cell-prefilled", cell.prefilled ? "1" : "0");
            this.updateCellDisplay(cell, selectedCell);
        }
    }
    setNotesButtonText(notesMode) {
        this.notesButton.innerText = `Notes: ${notesMode ? "ON" : "OFF"}`;
    }
    printBoard() {
        printElement(this.boardContainer);
    }
    // Getters for DOM elements to attach event listeners
    get cellElements() {
        return this.rows;
    }
    get resetButtonElement() {
        return this.resetButton;
    }
    get solveButtonElement() {
        return this.solveButton;
    }
    get randomButtonElement() {
        return this.randomButton;
    }
    get printButtonElement() {
        return this.printButton;
    }
    get keyboardElement() {
        return this.keyboard;
    }
    get notesButtonElement() {
        return this.notesButton;
    }
}
//# sourceMappingURL=SudokuUI.mjs.map
import { Cell } from "./Cell.mjs";
import { printElement } from "./print.mjs";
import type { WasmInterface } from "./WasmInterface.mjs";

export class SudokuUI {
  private boardContainer: HTMLDivElement;
  private keyboard: HTMLDivElement;
  private solveButton: HTMLButtonElement;
  private randomButton: HTMLButtonElement;
  private printButton: HTMLButtonElement;
  private resetButton: HTMLButtonElement;
  private notesButton: HTMLButtonElement;
  private cells: HTMLDivElement[][] = [];
  private wasmInterface: WasmInterface | null = null;
  private timerText: HTMLSpanElement;
  private startTime: number = 0;

  constructor() {
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
    this.timerText = document.getElementById(
      "timer-element",
    ) as HTMLSpanElement;
  }

  public resetTimer(): void {
    this.startTime = Date.now();
  }

  public updateTimer(): void {
    const elapsedSeconds = Math.floor((Date.now() - this.startTime) / 1000);
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;

    this.timerText.innerText = `${minutes} minutes ${seconds} seconds`;
  }

  setWasmInterface(wasmInterface: WasmInterface): void {
    this.wasmInterface = wasmInterface;
  }

  createTable(sideLength: number): HTMLDivElement[][] {
    this.boardContainer.innerHTML = "";
    this.cells = [];

    for (let y = 0; y < sideLength; ++y) {
      const cellsRow: HTMLDivElement[] = [];

      for (let x = 0; x < sideLength; ++x) {
        const cellItem = document.createElement("div");
        cellItem.classList.add("cell");

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

        cellsRow.push(cellItem);
        this.boardContainer.appendChild(cellItem);
      }

      this.cells.push(cellsRow);
    }

    return this.cells;
  }

  updateCellDisplay(cell: Cell, selectedCell: Cell | null = null): void {
    if (!cell.item || !this.wasmInterface) return;

    cell.item.classList.remove(
      "highlight-row",
      "highlight-col",
      "highlight-num",
      "highlight-subgrid",
      "empty-cell",
      "incorrect-cell",
    );

    if (!cell.innerGrid || !cell.textItem) {
      console.error(`Cell elements missing for [${cell.x}, ${cell.y}]`);
      return;
    }

    cell.innerGrid
      .querySelectorAll("div")
      .forEach((noteItem: HTMLDivElement): void => {
        const value = +noteItem.innerText;
        const notePresent = this.wasmInterface!.getCellNote(
          value - 1,
          ...cell.toArray(),
        );
        noteItem.classList.toggle("note-visible", notePresent);
        noteItem.setAttribute(
          "aria-selected",
          notePresent && selectedCell!.num === value ? "true" : "false",
        );
      });

    if (cell.textItem.textContent === "0") {
      cell.item.classList.add("empty-cell");
    }

    if (!selectedCell) return;

    const [x, y] = cell.toArray();
    const rowSelected = selectedCell.x === x;
    const colSelected = selectedCell.y === y;
    cell.item.setAttribute(
      "aria-selected",
      rowSelected && colSelected ? "true" : "false",
    );

    if (rowSelected) cell.item.classList.add("highlight-row");
    if (colSelected) cell.item.classList.add("highlight-col");

    const [subX, subY] = cell.subgrid();
    const [selectedSubX, selectedSubY] = selectedCell.subgrid();
    if (subX === selectedSubX && subY === selectedSubY) {
      cell.item.classList.add("highlight-subgrid");
    }

    if (
      selectedCell.num.toString() === cell.textItem.textContent &&
      cell.textItem.textContent !== "0"
    ) {
      cell.item.classList.add("highlight-num");
    }

    if (cell.incorrect) {
      cell.item.classList.add("incorrect-cell");
    }
  }

  drawBoard(board: Cell[], selectedCell: Cell | null = null): void {
    for (const cell of board) {
      if (!cell.textItem) {
        throw new Error(
          `Span of the [${cell.x}, ${cell.y}] cell is unavailable.`,
        );
      }

      cell.textItem.textContent = cell.num.toString();
      cell.item?.setAttribute(
        "data-cell-prefilled",
        cell.prefilled ? "1" : "0",
      );

      this.updateCellDisplay(cell, selectedCell);
    }
  }

  setNotesButtonText(notesMode: boolean): void {
    this.notesButton.innerText = `Notes: ${notesMode ? "ON" : "OFF"}`;
  }

  printBoard(): void {
    printElement(this.boardContainer);
  }

  // Getters for DOM elements to attach event listeners
  get cellElements(): HTMLDivElement[][] {
    return this.cells;
  }

  get resetButtonElement(): HTMLButtonElement {
    return this.resetButton;
  }

  get solveButtonElement(): HTMLButtonElement {
    return this.solveButton;
  }

  get randomButtonElement(): HTMLButtonElement {
    return this.randomButton;
  }

  get printButtonElement(): HTMLButtonElement {
    return this.printButton;
  }

  get keyboardElement(): HTMLDivElement {
    return this.keyboard;
  }

  get notesButtonElement(): HTMLButtonElement {
    return this.notesButton;
  }
}

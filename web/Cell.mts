export class Cell {
  public incorrect: boolean = false;
  public readonly textItem: HTMLSpanElement | null = null;
  public readonly innerGrid: HTMLDivElement | null = null;

  private static invalidCell = new Cell(-1, -1, -1, false, null);

  constructor(
    public readonly x: number,
    public readonly y: number,
    public num: number,
    public prefilled: boolean,
    public readonly item: HTMLDivElement | null,
  ) {
    if (this.item) {
      this.textItem = this.item.querySelector("span");
      this.innerGrid = this.item.querySelector("div");
    }
  }

  static invalid(): Cell {
    return this.invalidCell;
  }

  toArray(): [number, number] {
    return [this.x, this.y];
  }

  subgrid(): [number, number] {
    return [Math.floor(this.x / 3), Math.floor(this.y / 3)];
  }
}

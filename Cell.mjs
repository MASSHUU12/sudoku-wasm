export class Cell {
    x;
    y;
    num;
    prefilled;
    item;
    incorrect = false;
    textItem = null;
    innerGrid = null;
    static invalidCell = new Cell(-1, -1, -1, false, null);
    constructor(x, y, num, prefilled, item) {
        this.x = x;
        this.y = y;
        this.num = num;
        this.prefilled = prefilled;
        this.item = item;
        if (this.item) {
            this.textItem = this.item.querySelector("span");
            this.innerGrid = this.item.querySelector("div");
        }
    }
    static invalid() {
        return this.invalidCell;
    }
    toArray() {
        return [this.x, this.y];
    }
    subgrid() {
        return [Math.floor(this.x / 3), Math.floor(this.y / 3)];
    }
}
//# sourceMappingURL=Cell.mjs.map
import { SudokuController } from "./SudokuController.mjs";
(async function initialize() {
    const controller = new SudokuController("./main.wasm");
    await controller.initialize();
})();
//# sourceMappingURL=main.mjs.map
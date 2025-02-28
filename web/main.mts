import { SudokuController } from "./SudokuController.mjs";

(async function initialize(): Promise<void> {
  const controller = new SudokuController("./main.wasm");
  await controller.initialize();
})();

export interface WasmExports {
  memory: WebAssembly.Memory;
  setup: (seed: number) => void;
  solve_sudoku: () => boolean;
  get_board: () => number;
  get_board_size: () => number;
  get_solved_board: () => number;
  get_board_side_length: () => number;
  get_board_value: (x: number, y: number) => number;
  get_board_index: (x: number, y: number) => number;
  set_board_value: (
    v: number,
    x: number,
    y: number,
    prefilled: boolean,
  ) => boolean;
  reset_board: () => void;
  fill_test_board: () => void;
  fill_random_board: () => void;
  is_correct_attempt: (v: number, x: number, y: number) => boolean;
  is_board_solved: () => boolean;

  get_cell_notes: (x: number, y: number) => number;
  get_cell_note: (note: number, x: number, y: number) => boolean;
  set_cell_notes: (notes: number, x: number, y: number) => boolean;
  set_cell_note: (on: boolean, note: number, x: number, y: number) => number;
  reset_cell_notes: (x: number, y: number) => boolean;
  toggle_cell_note: (note: number, x: number, y: number) => number;
  cleanup_invalid_notes: (x: number, y: number) => void;
}

export enum GameState {
  INITIALIZING,
  PLAYING,
  SOLVED,
  LOCKED,
}

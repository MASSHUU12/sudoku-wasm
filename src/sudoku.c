#include "sudoku.h"
#include "log.h"
#include "memory.h"
#include "rand.h"
#include "str.h"
#include <stddef.h>

SudokuCell board[BOARD_SIZE] = {CELL_VALUE_EMPTY};
SudokuCell solved_board[BOARD_SIZE] = {CELL_VALUE_EMPTY};

SudokuCell stack[STACK_SIZE];
int32_t stack_top = -1;

// Stack operations
static bool push(SudokuCell cell) {
  if (stack_top >= STACK_SIZE - 1)
    return false;
  stack[++stack_top] = cell;
  return true;
}

static bool pop(SudokuCell *cell) {
  if (stack_top < 0)
    return false;
  *cell = stack[stack_top--];
  return true;
}

// Utility functions
static void log_board(const SudokuCell *b) {
  LOGF("Board %dx%d (%d cells)", BOARD_SIDE_LENGTH, BOARD_SIDE_LENGTH,
       BOARD_SIZE);

  uint8_t prefilled = 0;
  for (uint8_t y = 0; y < BOARD_SIDE_LENGTH; ++y) {
    char buffer[BOARD_SIDE_LENGTH * 2] = {0};
    for (uint8_t x = 0; x < BOARD_SIDE_LENGTH; ++x) {
      const uint8_t index = get_board_index(x, y);
      const SudokuCell cell = b[index];

      prefilled += cell.prefilled;

      mini_sprintf(buffer + x * 2, "%d ", cell.num);
    }
    console_log(buffer, BOARD_SIDE_LENGTH * 2);
  }

  LOGF("Prefilled: %d, empty: %d", prefilled, BOARD_SIZE - prefilled);
}

static bool is_in_range(const uint8_t x, const uint8_t y) {
  return !(x >= BOARD_SIDE_LENGTH || y >= BOARD_SIDE_LENGTH);
}

uint8_t get_board_index(const uint8_t x, const uint8_t y) {
  return y * BOARD_SIDE_LENGTH + x;
}

SudokuValue get_board_value(const uint8_t x, const uint8_t y) {
  return board[get_board_index(x, y)].num;
}

bool set_board_value(const SudokuValue value, const uint8_t x, const uint8_t y,
                     bool prefilled) {
  if (!is_in_range(x, y)) {
    return false;
  }

  SudokuCell *cell = &board[get_board_index(x, y)];
  if (cell->locked) {
    return false;
  }

  cell->x = x;
  cell->y = y;
  cell->num = value;
  cell->prefilled = prefilled;
  cell->locked = is_correct_attempt(value, x, y);
  reset_cell_notes(x, y);

  return true;
}

static void force_set_value(const SudokuValue value, const uint8_t x,
                            const uint8_t y, bool prefilled) {
  SudokuCell *cell = &board[get_board_index(x, y)];
  cell->x = x;
  cell->y = y;
  cell->num = value;
  cell->prefilled = prefilled;
  cell->locked = false;
}

static bool is_valid_number(const SudokuCell *board, const uint8_t num,
                            const uint8_t x, const uint8_t y) {
  const uint8_t box_x = (x / BOX_SIZE) * BOX_SIZE;
  const uint8_t box_y = (y / BOX_SIZE) * BOX_SIZE;

  for (uint8_t i = 0; i < BOARD_SIDE_LENGTH; i++) {
    if ((board[get_board_index(i, y)].num == num && i != x) ||
        (board[get_board_index(x, i)].num == num && i != y)) {
      return false;
    }
  }

  for (uint8_t i = 0; i < BOX_SIZE; i++) {
    for (uint8_t j = 0; j < BOX_SIZE; j++) {
      if (board[get_board_index(box_x + i, box_y + j)].num == num &&
          (box_x + i != x || box_y + j != y)) {
        return false;
      }
    }
  }

  return true;
}

static bool find_empty_cell(const SudokuCell *board, uint8_t *x, uint8_t *y) {
  for (uint8_t i = 0; i < BOARD_SIDE_LENGTH; ++i) {
    for (uint8_t j = 0; j < BOARD_SIDE_LENGTH; ++j) {
      if (board[get_board_index(j, i)].num == CELL_VALUE_EMPTY) {
        *x = j;
        *y = i;
        return true;
      }
    }
  }
  return false;
}

static void copy_board(SudokuCell *dest, const SudokuCell *src) {
  for (uint8_t i = 0; i < BOARD_SIZE; ++i) {
    dest[i].x = src[i].x;
    dest[i].y = src[i].y;
    dest[i].num = src[i].num;
    dest[i].prefilled = src[i].prefilled;
    dest[i].notes = src[i].notes;
    dest[i].locked = src[i].locked;
  }
}

// Sudoku solving functions
bool solve_sudoku(void) {
  stack_top = -1;

  copy_board(solved_board, board);

  uint8_t x = 0, y = 0;
  if (!find_empty_cell(solved_board, &x, &y)) {
    return true;
  }

  if (!push(SUDOKU_CELL(x, y, CELL_VALUE_MIN, 0))) {
    return false;
  }

  SudokuCell current;
  while (stack_top >= 0) {
    if (!pop(&current)) {
      break;
    }

    bool found = false;
    const uint8_t cell_index = get_board_index(current.x, current.y);

    if (solved_board[cell_index].prefilled) {
      continue;
    }

    for (uint8_t num = current.num; num <= CELL_VALUE_MAX; ++num) {
      if (is_valid_number(solved_board, num, current.x, current.y)) {
        solved_board[cell_index].num = num;

        // Push the current state back (in case we need to backtrack)
        current.num = num + 1;
        if (!push(current)) {
          return false;
        }

        if (!find_empty_cell(solved_board, &x, &y)) {
          return true;
        }

        if (!push(SUDOKU_CELL(x, y, CELL_VALUE_MIN, 0))) {
          return false;
        }

        found = true;
        break;
      }
    }

    if (!found) {
      // If no valid number was found, clear the cell and continue with
      // backtracking
      solved_board[cell_index].num = CELL_VALUE_EMPTY;
    }
  }

  return false;
}

// Board generation functions
static void shuffle_array(uint8_t *array, const size_t n) {
  if (n > 1) {
    for (size_t i = 0; i < n - 1; i++) {
      const size_t j = i + random(0, n - i - 1);
      const uint8_t t = array[j];
      array[j] = array[i];
      array[i] = t;
    }
  }
}

static bool generate_solved_board(void) {
  uint8_t numbers[BOARD_SIDE_LENGTH];
  for (uint8_t i = 0; i < BOARD_SIDE_LENGTH; ++i) {
    numbers[i] = i + 1;
  }

  shuffle_array(numbers, BOARD_SIDE_LENGTH);

  for (uint8_t y = 0; y < BOARD_SIDE_LENGTH; ++y) {
    for (uint8_t x = 0; x < BOARD_SIDE_LENGTH; ++x) {
      force_set_value(CELL_VALUE_EMPTY, x, y, false);
    }
  }

  uint8_t x = 0, y = 0;
  find_empty_cell(board, &x, &y);

  for (uint8_t i = 0; i < BOARD_SIDE_LENGTH; ++i) {
    if (is_valid_number(board, numbers[i], x, y)) {
      board[get_board_index(x, y)].num = numbers[i];
      if (solve_sudoku()) {
        return true;
      }
      board[get_board_index(x, y)].num = CELL_VALUE_EMPTY;
    }
  }

  return false;
}

static uint8_t count_solutions(SudokuCell *board) {
  uint8_t x = 0, y = 0;
  if (!find_empty_cell(board, &x, &y)) {
    return true;
  }

  uint8_t count = 0;
  for (uint8_t num = CELL_VALUE_MIN; num <= CELL_VALUE_MAX; ++num) {
    if (is_valid_number(board, num, x, y)) {
      board[get_board_index(x, y)].num = num;
      count += count_solutions(board);
      if (count > 1) {
        break;
      }
      board[get_board_index(x, y)].num = CELL_VALUE_EMPTY;
    }
  }

  return count;
}

void reset_board(void) {
  for (int i = 0; i < BOARD_SIZE; ++i) {
    SudokuCell *cell = &board[i];

    if (cell->prefilled)
      continue;

    cell->num = 0;
    cell->notes = 0;
    cell->locked = false;
  }
}

void fill_random_board(void) {
  if (!generate_solved_board()) {
    LOG("Failed to generate a solved board");
    return;
  }

  memcpy(board, solved_board, sizeof(board));

  uint8_t indices[BOARD_SIZE];
  for (uint8_t i = 0; i < BOARD_SIZE; ++i) {
    indices[i] = i;
  }

  shuffle_array(indices, BOARD_SIZE);

  // Remove numbers from the board until the desired number of clues is reached
  uint8_t removed = 0;
  for (uint8_t i = 0; i < BOARD_SIZE && (BOARD_SIZE - removed) > MINIMUM_CLUES;
       ++i) {
    const uint8_t index = indices[i];
    const uint8_t x = index % BOARD_SIDE_LENGTH;
    const uint8_t y = index / BOARD_SIDE_LENGTH;

    SudokuValue backup = board[index].num;
    force_set_value(CELL_VALUE_EMPTY, x, y, false);

    // Create a copy of the board and solve it to check for uniqueness;
    SudokuCell temp_board[BOARD_SIZE];
    memcpy(temp_board, board, sizeof(board));

    if (count_solutions(temp_board) != 1) {
      // If the board does not have a unique solution, restore the number
      force_set_value(backup, x, y, true);
    } else {
      removed++;
    }
  }

  log_board(board);
}

// Test functions
void fill_test_board(void) {
  static const SudokuValue b[BOARD_SIDE_LENGTH][BOARD_SIDE_LENGTH] = {
      {5, 3, 0, 2, 7, 4, 6, 8, 9}, {6, 2, 8, 1, 0, 5, 3, 4, 7},
      {4, 9, 7, 3, 6, 8, 1, 2, 5}, {1, 4, 2, 5, 3, 6, 7, 9, 8},
      {3, 5, 6, 7, 8, 9, 2, 1, 4}, {7, 8, 9, 4, 1, 2, 5, 3, 6},
      {2, 1, 4, 8, 5, 7, 9, 6, 3}, {8, 6, 5, 9, 2, 3, 4, 7, 1},
      {9, 7, 3, 6, 4, 1, 8, 5, 2},
  };

  for (SudokuValue y = 0; y < BOARD_SIDE_LENGTH; ++y) {
    for (SudokuValue x = 0; x < BOARD_SIDE_LENGTH; ++x) {
      set_board_value(b[y][x], x, y, b[y][x] != 0);
    }
  }
}

// Board accessors
uint8_t get_board_side_length(void) { return BOARD_SIDE_LENGTH; }

uint8_t get_board_size(void) { return BOARD_SIZE; }

SudokuCell *get_board(void) { return board; }

SudokuCell *get_solved_board(void) { return solved_board; }

bool is_correct_attempt(const SudokuValue value, const uint8_t x,
                        const uint8_t y) {
  return value == solved_board[get_board_index(x, y)].num;
}

bool is_board_solved() {
  for (uint8_t i = 0; i < BOARD_SIZE; ++i) {
    if (board[i].num != solved_board[i].num) {
      return false;
    }
  }

  return true;
}

// Notes
bool toggle_cell_note(const uint16_t note, const uint8_t x, const uint8_t y) {
  if (!is_in_range(x, y)) {
    return false;
  }

  SudokuCell *cell = &board[get_board_index(x, y)];

  const uint16_t note_mask = (1 << note);

  cell->notes ^= note_mask;

  return true;
}

bool set_cell_note(const bool on, const uint16_t note, const uint8_t x,
                   const uint8_t y) {
  if (!is_in_range(x, y)) {
    return false;
  }

  SudokuCell *cell = &board[get_board_index(x, y)];

  const uint16_t note_mask = (1 << note);

  if (on) {
    cell->notes |= note_mask;
  } else {
    cell->notes &= ~note_mask;
  }

  return true;
}

int16_t get_cell_notes(const uint8_t x, const uint8_t y) {
  return !is_in_range(x, y) ? (&board[get_board_index(x, y)])->notes : -1;
}

bool get_cell_note(const uint16_t note, const uint8_t x, const uint8_t y) {
  if (!is_in_range(x, y)) {
    return false;
  }

  SudokuCell *cell = &board[get_board_index(x, y)];

  return ((1 << note) & cell->notes) != 0;
}

bool set_cell_notes(const uint16_t notes, const uint8_t x, const uint8_t y) {
  if (!is_in_range(x, y)) {
    return false;
  }

  SudokuCell *cell = &board[get_board_index(x, y)];
  cell->notes = notes;

  return true;
}

bool reset_cell_notes(const uint8_t x, const uint8_t y) {
  return set_cell_notes(0, x, y);
}

void cleanup_invalid_notes(const uint8_t x, const uint8_t y) {
  const SudokuCell cell = board[get_board_index(x, y)];

  if (cell.num == CELL_VALUE_EMPTY || !is_correct_attempt(cell.num, x, y))
    return;

  // Notes are 0-indexed (note 0 corresponds to value 1)
  const uint8_t note_index = cell.num - 1;

  // Update row notes
  for (uint8_t i = 0; i < BOARD_SIDE_LENGTH; ++i) {
    if (i == x)
      continue;

    if (get_cell_note(note_index, i, y)) {
      set_cell_note(false, note_index, i, y);
    }
  }

  // Update column notes
  for (uint8_t i = 0; i < BOARD_SIDE_LENGTH; ++i) {
    if (i == y)
      continue;

    if (get_cell_note(note_index, x, i)) {
      set_cell_note(false, note_index, x, i);
    }
  }

  // Update box/subgrid notes
  const uint8_t box_x = (x / BOX_SIZE) * BOX_SIZE;
  const uint8_t box_y = (y / BOX_SIZE) * BOX_SIZE;

  for (uint8_t i = 0; i < BOX_SIZE; ++i) {
    for (uint8_t j = 0; j < BOX_SIZE; ++j) {
      const uint8_t current_x = box_x + j;
      const uint8_t current_y = box_y + i;

      // Skip the current cell and cells already handled by row/column logic
      if (current_x == x || current_y == y)
        continue;

      if (get_cell_note(note_index, current_x, current_y)) {
        set_cell_note(false, note_index, current_x, current_y);
      }
    }
  }
}

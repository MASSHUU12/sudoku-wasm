#include "sudoku.h"
#include "log.h"
#include "memory.h"
#include "str.h"
#include <stddef.h>

uint8_t board[BOARD_SIZE] = {CELL_VALUE_EMPTY};
uint8_t solved_board[BOARD_SIZE] = {CELL_VALUE_EMPTY};

SudokuCell stack[STACK_SIZE];
int32_t stack_top = -1;

// Stack operations
_Bool push(SudokuCell cell) {
  if (stack_top >= STACK_SIZE - 1)
    return 0;
  stack[++stack_top] = cell;
  return 1;
}

_Bool pop(SudokuCell *cell) {
  if (stack_top < 0)
    return 0;
  *cell = stack[stack_top--];
  return 1;
}

void log_board(const uint8_t *b) {
  for (uint16_t y = 0; y < BOARD_SIDE_LENGTH; ++y) {
    char buffer[BOARD_SIDE_LENGTH * 2] = {0};
    for (uint16_t x = 0; x < BOARD_SIDE_LENGTH; ++x) {
      mini_sprintf(buffer + x * 2, "%d ", b[y * BOARD_SIDE_LENGTH + x]);
    }
    console_log(buffer, BOARD_SIDE_LENGTH * 2);
  }
}

uint16_t get_board_index(const uint16_t x, const uint16_t y) {
  return y * BOARD_SIDE_LENGTH + x;
}

_Bool set_board_value(const uint8_t value, const uint16_t x, const uint16_t y) {
  if (x >= BOARD_SIDE_LENGTH || y >= BOARD_SIDE_LENGTH) {
    return 0;
  }

  board[get_board_index(x, y)] = value;
  return 1;
}

int32_t get_board_side_length(void) { return BOARD_SIDE_LENGTH; }

int32_t get_board_size(void) { return BOARD_SIZE; }

uint8_t *get_board(void) { return board; }

uint8_t *get_solved_board(void) { return solved_board; }

_Bool is_valid_number(const uint8_t *board, const uint8_t num, const uint16_t x,
                      const uint16_t y) {
  const uint16_t box_x = (x / BOX_SIZE) * BOX_SIZE;
  const uint16_t box_y = (y / BOX_SIZE) * BOX_SIZE;

  for (uint16_t i = 0; i < BOARD_SIDE_LENGTH; i++) {
    if ((board[get_board_index(i, y)] == num && i != x) ||
        (board[get_board_index(x, i)] == num && i != y)) {
      return 0;
    }
  }

  for (uint16_t i = 0; i < BOX_SIZE; i++) {
    for (uint16_t j = 0; j < BOX_SIZE; j++) {
      if (board[get_board_index(box_x + i, box_y + j)] == num &&
          (box_x + i != x || box_y + j != y)) {
        return 0;
      }
    }
  }

  return 1;
}

_Bool find_empty_cell(const uint8_t *board, uint16_t *x, uint16_t *y) {
  for (uint16_t i = 0; i < BOARD_SIDE_LENGTH; ++i) {
    for (uint16_t j = 0; j < BOARD_SIDE_LENGTH; ++j) {
      if (board[get_board_index(j, i)] == CELL_VALUE_EMPTY) {
        *x = j;
        *y = i;
        return 1;
      }
    }
  }
  return 0;
}

_Bool solve_sudoku(void) {
  stack_top = -1;

  memcpy(solved_board, board, BOARD_SIZE);

  uint16_t x = 0, y = 0;
  if (!find_empty_cell(solved_board, &x, &y)) {
    log_board(solved_board);
    return 1;
  }

  const SudokuCell initial = {x, y, CELL_VALUE_MIN};
  if (!push(initial)) {
    return 0;
  }

  SudokuCell current;
  while (stack_top >= 0) {
    if (!pop(&current)) {
      break;
    }

    int32_t found = 0;
    const uint16_t cell_index = get_board_index(current.x, current.y);

    for (uint8_t num = current.num; num <= CELL_VALUE_MAX; ++num) {
      if (is_valid_number(solved_board, num, current.x, current.y)) {
        solved_board[cell_index] = num;

        // Push the current state back (in case we need to backtrack)
        current.num = num + 1;
        if (!push(current)) {
          return 0;
        }

        if (!find_empty_cell(solved_board, &x, &y)) {
          log_board(solved_board);
          return 1;
        }

        if (!push((SudokuCell){x, y, CELL_VALUE_MIN})) {
          return 0;
        }

        found = 1;
        break;
      }
    }

    if (!found) {
      // If no valid number was found, clear the cell and continue with
      // backtracking
      solved_board[cell_index] = CELL_VALUE_EMPTY;
    }
  }

  return 0;
}

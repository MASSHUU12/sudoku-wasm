#include "sudoku.h"
#include "log.h"
#include "str.h"
#include <stddef.h>
#include "memory.h"

uint8_t board[board_size]{cell_value_empty};
uint8_t solved_board[board_size]{cell_value_empty};

SudokuCell stack[stack_size];
int stack_top = -1;

// Stack operations
bool push(SudokuCell cell) {
  if (stack_top >= stack_size - 1)
    return false;
  stack[++stack_top] = cell;
  return true;
}

bool pop(SudokuCell *cell) {
  if (stack_top < 0)
    return false;
  *cell = stack[stack_top--];
  return true;
}

void log_board(uint8_t *b) {
  for (uint16_t y = 0; y < board_side_length; ++y) {
    char buffer[board_side_length * 2] = {0};
    for (uint16_t x = 0; x < board_side_length; ++x) {
      mini_sprintf(buffer + x * 2, "%d ", b[y * board_side_length + x]);
    }
    console_log(buffer, board_side_length * 2);
  }
}

uint16_t get_board_index(const uint16_t x, const uint16_t y) {
  return y * board_side_length + x;
}

bool set_board_value(const uint8_t value, const uint16_t x, const uint16_t y) {
  if (x >= board_side_length || y >= board_side_length) {
    return false;
  }

  board[get_board_index(x, y)] = value;
  return true;
}

int get_board_side_length() { return board_side_length; }

int get_board_size() { return board_size; }

uint8_t *get_board() { return board; }

uint8_t *get_solved_board() { return solved_board; }

bool is_valid_number(uint8_t *board, uint8_t num, uint16_t x, uint16_t y) {
  const uint16_t box_x = (x / box_size) * box_size;
  const uint16_t box_y = (y / box_size) * box_size;

  for (uint16_t i = 0; i < board_side_length; i++) {
    if ((board[get_board_index(i, y)] == num && i != x) ||
        (board[get_board_index(x, i)] == num && i != y)) {
      return false;
    }
  }

  for (uint16_t i = 0; i < box_size; i++) {
    for (uint16_t j = 0; j < box_size; j++) {
      if (board[get_board_index(box_x + i, box_y + j)] == num &&
          (box_x + i != x || box_y + j != y)) {
        return false;
      }
    }
  }

  return true;
}

bool find_empty_cell(uint8_t *board, uint16_t *x, uint16_t *y) {
  for (uint16_t i = 0; i < board_side_length; ++i) {
    for (uint16_t j = 0; j < board_side_length; ++j) {
      if (board[get_board_index(j, i)] == cell_value_empty) {
        *x = j;
        *y = i;
        return true;
      }
    }
  }
  return false;
}

bool solve_sudoku() {
  stack_top = -1;

  memcpy(solved_board, board, board_size);

  uint16_t x = 0, y = 0;
  if (!find_empty_cell(solved_board, &x, &y)) {
    log_board(solved_board);
    return true;
  }

  const SudokuCell initial = {x, y, cell_value_min};
  if (!push(initial)) {
    return false;
  }

  SudokuCell current;
  while (stack_top >= 0) {
    if (!pop(&current)) {
      break;
    }

    bool found = false;
    const uint16_t cell_index = get_board_index(current.x, current.y);

    for (uint8_t num = current.num; num <= cell_value_max; ++num) {
      if (is_valid_number(solved_board, num, current.x, current.y)) {
        solved_board[cell_index] = num;

        // Push the current state back (in case we need to backtrack)
        current.num = num + 1;
        if (!push(current)) {
          return false;
        }

        if (!find_empty_cell(solved_board, &x, &y)) {
          log_board(solved_board);
          return true;
        }

        if (!push({x, y, cell_value_min})) {
          return false;
        }

        found = true;
        break;
      }
    }

    if (!found) {
      // If no valid number was found, clear the cell and continue with
      // backtracking
      solved_board[cell_index] = cell_value_empty;
    }
  }

  return false;
}

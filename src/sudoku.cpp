#include "sudoku.h"

uint8_t board[board_size]{cell_value_empty};

uint16_t get_board_index(const uint16_t x, const uint16_t y) {
  return y * board_side_length + x;
}

bool set_board_value(const uint8_t value, const uint16_t x, const uint16_t y) {
  if (x >= board_side_length || y >= board_side_length ||
      value > cell_value_max || value < cell_value_min) {
    return false;
  }

  board[get_board_index(x, y)] = value;

  return true;
}

int get_board_side_length() { return board_side_length; }

int get_board_size() { return board_size; }

uint8_t *get_board() { return board; }

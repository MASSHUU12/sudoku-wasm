#include <stdint.h>
#include <stddef.h>
#include "rand.h"

uint32_t seed{};

constexpr uint8_t cell_value_min = 1;
constexpr uint8_t cell_value_max = 9;
constexpr uint8_t cell_value_empty = 0;

constexpr uint16_t board_side_length = 9;
constexpr uint16_t board_size = board_side_length * board_side_length;
static uint8_t board[board_size]{cell_value_empty};

extern "C" {
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

void setup(uint32_t new_seed) {
  seed = new_seed;

  for (size_t y = 0; y < board_side_length; ++y) {
    for (size_t x = 0; x < board_side_length; ++x) {
      board[get_board_index(x, y)] = random(cell_value_min, cell_value_max);
    }
  }
}
}

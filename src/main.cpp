#include <stdint.h>
#include <stddef.h>
#include "rand.h"
#include "sudoku.h"

uint32_t seed{};

extern "C" {
void setup(uint32_t new_seed) {
  seed = new_seed;

  for (size_t y = 0; y < board_side_length; ++y) {
    for (size_t x = 0; x < board_side_length; ++x) {
      board[get_board_index(x, y)] = random(cell_value_min, cell_value_max);
    }
  }
}
}

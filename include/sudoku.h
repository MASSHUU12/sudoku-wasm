#ifndef SUDOKU_H_
#define SUDOKU_H_

#include <stdint.h>

constexpr uint8_t minimum_clues = 17;

constexpr uint8_t cell_value_min = 1;
constexpr uint8_t cell_value_max = 9;
constexpr uint8_t cell_value_empty = 0;

constexpr uint16_t board_side_length = 9;
constexpr uint16_t board_size = board_side_length * board_side_length;

extern uint8_t board[board_size];

extern "C" {
uint8_t *get_board();
int get_board_size();
int get_board_side_length();
uint16_t get_board_index(const uint16_t x, const uint16_t y);
bool set_board_value(const uint8_t value, const uint16_t x, const uint16_t y);
}

#endif // SUDOKU_H_

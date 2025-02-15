#ifndef SUDOKU_H_
#define SUDOKU_H_

#include <stddef.h>
#include <stdint.h>

constexpr uint8_t minimum_clues = 17;

constexpr uint8_t box_size = 3;
constexpr uint8_t cell_value_min = 1;
constexpr uint8_t cell_value_max = 9;
constexpr uint8_t cell_value_empty = 0;

constexpr uint16_t board_side_length = 9;
constexpr uint16_t board_size = board_side_length * board_side_length;

extern uint8_t board[board_size];
extern uint8_t solved_board[board_size];

typedef struct {
  uint16_t x;
  uint16_t y;
  uint8_t num;
} SudokuCell;

constexpr uint16_t stack_size = board_size * 10;
extern SudokuCell stack[stack_size];

void log_board(uint8_t *b);

extern "C" {
uint8_t *get_board();
uint8_t *get_solved_board();
int get_board_size();
int get_board_side_length();
uint16_t get_board_index(const uint16_t x, const uint16_t y);
bool set_board_value(const uint8_t value, const uint16_t x, const uint16_t y);
bool solve_sudoku();
bool is_valid_number(uint8_t *board, uint8_t num, uint16_t x, uint16_t y);
bool find_empty_cell(uint8_t *board, uint16_t *x, uint16_t *y);
}

#endif // SUDOKU_H_

#ifndef SUDOKU_H_
#define SUDOKU_H_

#include <stddef.h>
#include <stdint.h>

#define MINIMUM_CLUES 17

#define BOX_SIZE 3
#define CELL_VALUE_MIN 1
#define CELL_VALUE_MAX 9
#define CELL_VALUE_EMPTY 0

#define BOARD_SIDE_LENGTH 9
#define BOARD_SIZE (BOARD_SIDE_LENGTH * BOARD_SIDE_LENGTH)

typedef uint8_t SudokuValue;

typedef struct {
  uint8_t x;
  uint8_t y;
  SudokuValue num;
  _Bool prefilled;
} SudokuCell;

extern SudokuCell board[BOARD_SIZE];
extern SudokuCell solved_board[BOARD_SIZE];

#define STACK_SIZE (BOARD_SIZE * 10)
extern SudokuCell stack[STACK_SIZE];

#ifdef __cplusplus
extern "C" {
#endif

void log_board(const SudokuCell *b);
SudokuCell *get_board(void);
SudokuCell *get_solved_board(void);
uint8_t get_board_size(void);
uint8_t get_board_side_length(void);
uint8_t get_board_index(const uint8_t x, const uint8_t y);
SudokuValue get_board_value(const uint8_t x, const uint8_t y);
_Bool set_board_value(const SudokuValue value, const uint8_t x,
                      const uint8_t y, _Bool prefilled);
_Bool solve_sudoku(void);
_Bool is_valid_number(const SudokuCell *board, const uint8_t num,
                      const uint8_t x, const uint8_t y);
_Bool find_empty_cell(const SudokuCell *board, uint8_t *x, uint8_t *y);
void fill_test_board(void);

#ifdef __cplusplus
}
#endif

#endif // SUDOKU_H_

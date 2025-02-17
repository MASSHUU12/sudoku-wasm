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

extern uint8_t board[BOARD_SIZE];
extern uint8_t solved_board[BOARD_SIZE];

typedef struct {
  uint16_t x;
  uint16_t y;
  uint8_t num;
} SudokuCell;

#define STACK_SIZE (BOARD_SIZE * 10)
extern SudokuCell stack[STACK_SIZE];

#ifdef __cplusplus
extern "C" {
#endif

void log_board(const uint8_t *b);
uint8_t *get_board(void);
uint8_t *get_solved_board(void);
int32_t get_board_size(void);
int32_t get_board_side_length(void);
uint16_t get_board_index(const uint16_t x, const uint16_t y);
_Bool set_board_value(const uint8_t value, const uint16_t x, const uint16_t y);
_Bool solve_sudoku(void);
_Bool is_valid_number(const uint8_t *board, const uint8_t num, const uint16_t x,
                      const uint16_t y);
_Bool find_empty_cell(const uint8_t *board, uint16_t *x, uint16_t *y);

#ifdef __cplusplus
}
#endif

#endif // SUDOKU_H_

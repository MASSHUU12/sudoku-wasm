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
  uint8_t x;         // 1 byte
  uint8_t y;         // 1 byte
  SudokuValue num;   // 1 byte
  bool prefilled;    // 1 byte
  uint16_t notes;    // 2 bytes
  bool locked;       // 1 byte
  uint8_t alignment; // 1 byte
} SudokuCell;

#define SUDOKU_CELL(x, y, num, pref)                                           \
  (SudokuCell){(x), (y), (num), (pref), 0, 0, 0}

extern SudokuCell board[BOARD_SIZE];
extern SudokuCell solved_board[BOARD_SIZE];

#define STACK_SIZE (BOARD_SIZE * 10)
extern SudokuCell stack[STACK_SIZE];

#ifdef __cplusplus
extern "C" {
#endif

SudokuCell *get_board(void);
SudokuCell *get_solved_board(void);
uint8_t get_board_size(void);
uint8_t get_board_side_length(void);
uint8_t get_board_index(const uint8_t x, const uint8_t y);
SudokuValue get_board_value(const uint8_t x, const uint8_t y);

bool set_board_value(const SudokuValue value, const uint8_t x, const uint8_t y,
                     bool prefilled);
bool solve_sudoku(void);

bool is_correct_attempt(const SudokuValue value, const uint8_t x,
                        const uint8_t y);
bool is_board_solved();

void reset_board(void);
void fill_test_board(void);
void fill_random_board(void);

bool set_cell_note(const bool on, const uint16_t note, const uint8_t x,
                   const uint8_t y);
bool toggle_cell_note(const uint16_t note, const uint8_t x, const uint8_t y);
bool reset_cell_notes(const uint8_t x, const uint8_t y);
int16_t get_cell_notes(const uint8_t x, const uint8_t y);
bool get_cell_note(const uint16_t note, const uint8_t x, const uint8_t y);
bool set_cell_notes(const uint16_t notes, const uint8_t x, const uint8_t y);
void cleanup_invalid_notes(const uint8_t x, const uint8_t y);

#ifdef __cplusplus
}
#endif

#endif // SUDOKU_H_

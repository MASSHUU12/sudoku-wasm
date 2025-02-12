#ifndef STR_H_
#define STR_H_

#include <stdarg.h>
#include <stddef.h>

#define TOSTRING2(x) #x
#define TOSTRING(x) TOSTRING2(x)
#define AT "[" __FILE_NAME__ ":" TOSTRING(__LINE__) "] "

/**
 * Copies up to n characters from src to dest.
 * If src is shorter than n, dest will be padded with '\0'.
 * If src is longer than n, it will be truncated.
 * The function returns the dest pointer.
 */
char *strncpy(char *dest, const char *src, size_t n);

/**
 * A simplified version of sprintf that handles:
 *   %d  - integer
 *   %s  - string
 *   %c  - character
 *
 * @param buffer: The buffer into which output will be written.
 * @param format: A C string that contains text plus optional format specifiers.
 * @param ...   : A variable number of arguments corresponding to the format.
 *
 * @return The number of characters written (excluding the null terminator).
 */
int mini_sprintf(char *buffer, const char *format, ...);

/**
 * Converts an integer to a string (base 10). This function handles negative
 * integers as well.
 *
 * @param value: The integer to convert.
 * @param buffer: The buffer where the string representation will be stored.
 */
void itoa(int value, char *buffer);

size_t strlen(const char *str);

/** Custom implementation of strcmp.
 *
 * Returns:
 *   0 if strings are equal
 *   < 0 if str1 is less than str2
 * > 0 if str1 is greater than str2
 */
int strcmp(const char *str1, const char *str2);

#endif // STR_H_

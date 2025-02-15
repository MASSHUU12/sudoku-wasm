#include "str.h"
#include <stdint.h>

void itoa(int value, char *buffer) {
  char temp[32];
  int sign = (value < 0) ? -1 : 1;
  int i = 0;

  if (value == 0) {
    buffer[0] = '0';
    buffer[1] = '\0';
    return;
  }

  // Work with absolute value
  uint32_t val = sign * value;

  // Build the number string in reverse
  while (val > 0) {
    temp[i++] = (val % 10) + '0';
    val /= 10;
  }

  if (sign < 0) {
    temp[i++] = '-';
  }

  // Reverse the string into the final buffer
  int j = 0;
  while (i > 0) {
    buffer[j++] = temp[--i];
  }
  buffer[j] = '\0';
}

void utoa(size_t value, char *str) {
  char buffer[32];
  int pos = 0;

  // Special case for 0
  if (value == 0) {
    str[0] = '0';
    str[1] = '\0';
    return;
  }

  // Convert number to string in reverse order
  while (value > 0) {
    buffer[pos++] = '0' + (value % 10);
    value /= 10;
  }

  // Copy reversed string into output buffer in correct order
  int i;
  for (i = 0; i < pos; i++) {
    str[i] = buffer[pos - i - 1];
  }
  str[i] = '\0';
}

char *strncpy(char *dest, const char *src, size_t n) {
  size_t i;

  for (i = 0; i < n && src[i] != '\0'; i++) {
    dest[i] = src[i];
  }

  for (; i < n; i++) {
    dest[i] = '\0';
  }

  return dest;
}

int mini_sprintf(char *buffer, const char *format, ...) {
  va_list args;
  va_start(args, format);

  char *str_ptr;
  char char_val;
  int count = 0;

  while (*format) {
    if (*format == '%') {
      format++; // Move past '%'

      if (*format == 'z') {
        if (*(format + 1) == 'u') {
          format++; // Skip 'z' then 'u'
          size_t size_val = va_arg(args, size_t);
          char size_str[32];
          utoa(size_val, size_str);
          for (int i = 0; size_str[i] != '\0'; i++) {
            buffer[count++] = size_str[i];
          }
          format++; // Move past 'u'
          continue; // Restart loop
        }
      }

      switch (*format) {
      case 'd': // integer
      {
        int int_val = va_arg(args, int);
        char int_str[32];
        itoa(int_val, int_str);

        for (int i = 0; int_str[i] != '\0'; i++) {
          buffer[count++] = int_str[i];
        }
        break;
      }

      case 's': // string
        str_ptr = va_arg(args, char *);
        if (str_ptr) {
          while (*str_ptr) {
            buffer[count++] = *str_ptr++;
          }
        }
        break;

      case 'c': // character
        char_val = (char)va_arg(args, int);
        buffer[count++] = char_val;
        break;

      default:
        // If the format specifier is unknown, treat it as a normal character
        buffer[count++] = *format;
        break;
      }
    } else {
      buffer[count++] = *format;
    }
    format++;
  }

  buffer[count] = '\0';

  va_end(args);
  return count;
}

size_t strlen(const char *str) {
  size_t len = 0;
  while (*str != '\0') {
    len++;
    str++;
  }
  return len;
}
int strcmp(const char *str1, const char *str2) {
  if (str1 == NULL && str2 == NULL)
    return 0;
  if (str1 == NULL)
    return -1;
  if (str2 == NULL)
    return 1;

  while (*str1 && (*str1 == *str2)) {
    str1++;
    str2++;
  }

  return *(unsigned char *)str1 - *(unsigned char *)str2;
}

#ifndef LOG_H_
#define LOG_H_

#include <stdint.h>
#include "str.h"

#define LOG(message) console_log(AT message, sizeof(AT message) - 1)
#define INFO(message) console_info(AT message, sizeof(AT message) - 1)
#define ERROR(message) console_error(AT message, sizeof(AT message) - 1)
#define WARN(message) console_warn(AT message, sizeof(AT message) - 1)

extern "C" {
  void console_log(const char *message, int16_t length);
  void console_info(const char *message, int16_t length);
  void console_error(const char *message, int16_t length);
  void console_warn(const char *message, int16_t length);
}

#endif // LOG_H_

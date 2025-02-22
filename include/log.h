#ifndef LOG_H_
#define LOG_H_

#include "str.h"
#include <stdarg.h>
#include <stdint.h>

#define LOG(message) console_log(AT message, sizeof(AT message) - 1)
#define INFO(message) console_info(AT message, sizeof(AT message) - 1)
#define ERROR(message) console_error(AT message, sizeof(AT message) - 1)
#define WARN(message) console_warn(AT message, sizeof(AT message) - 1)

#define BUFFER_SIZE 256

#define LOG_BASE(func, format, ...)                                            \
  do {                                                                         \
    char buf[BUFFER_SIZE];                                                     \
    int32_t len = mini_sprintf(buf, (format), __VA_ARGS__);                    \
    if (len < 0) {                                                             \
      len = 0;                                                                 \
    } else if (len > BUFFER_SIZE - 1) {                                        \
      len = BUFFER_SIZE - 1;                                                   \
    }                                                                          \
    func(buf, (int32_t)len);                                                   \
  } while (0)

#define LOGF(format, ...) LOG_BASE(console_log, format, __VA_ARGS__)
#define INFOF(format, ...) LOG_BASE(console_info, format, __VA_ARGS__)
#define ERRORF(format, ...) LOG_BASE(console_error, format, __VA_ARGS__)
#define WARNF(format, ...) LOG_BASE(console_warn, format, __VA_ARGS__)

#ifdef __cplusplus
extern "C" {
#endif

void console_log(const char *message, size_t length);
void console_info(const char *message, size_t length);
void console_error(const char *message, size_t length);
void console_warn(const char *message, size_t length);

#ifdef __cplusplus
}
#endif

#endif // LOG_H_

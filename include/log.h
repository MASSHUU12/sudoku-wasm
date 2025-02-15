#ifndef LOG_H_
#define LOG_H_

#include "str.h"
#include <stdint.h>

#define LOG(message) console_log(AT message, sizeof(AT message) - 1)
#define INFO(message) console_info(AT message, sizeof(AT message) - 1)
#define ERROR(message) console_error(AT message, sizeof(AT message) - 1)
#define WARN(message) console_warn(AT message, sizeof(AT message) - 1)

#define BUFFER_SIZE 256

#define LOG_BASE(func, format, ...)                                            \
  do {                                                                         \
    char buf[BUFFER_SIZE];                                                     \
    int len = mini_sprintf(buf, (format));                                     \
    if (len < 0) {                                                             \
      len = 0;                                                                 \
    } else if (len > BUFFER_SIZE - 1) {                                        \
      len = BUFFER_SIZE - 1;                                                   \
    }                                                                          \
    func(buf, (int16_t)len);                                                   \
  } while (0)

#define LOGF(format, ...) LOG_BASE(console_log, format)
#define INFOF(format, ...) LOG_BASE(console_info, format)
#define ERRORF(format, ...) LOG_BASE(console_error, format)
#define WARNF(format, ...) LOG_BASE(console_warn, format)

#ifdef __cplusplus
extern "C" {
#endif

__attribute__((visibility("default"))) void console_log(const char *message,
                                                        int16_t length);
__attribute__((visibility("default"))) void console_info(const char *message,
                                                         int16_t length);
__attribute__((visibility("default"))) void console_error(const char *message,
                                                          int16_t length);
__attribute__((visibility("default"))) void console_warn(const char *message,
                                                         int16_t length);

#ifdef __cplusplus
}
#endif

#endif // LOG_H_

#include "memory.h"

void *memcpy(void *destination, const void *source, size_t num) {
  char *dest = static_cast<char *>(destination);
  const char *src = static_cast<const char *>(source);

  for (size_t i = 0; i < num; ++i) {
    dest[i] = src[i];
  }

  return destination;
}

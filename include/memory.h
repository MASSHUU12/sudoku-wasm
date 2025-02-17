#ifndef MEMORY_H_
#define MEMORY_H_

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

void *memcpy(void *destination, const void *source, size_t num);

#ifdef __cplusplus
}
#endif

#endif // MEMORY_H_

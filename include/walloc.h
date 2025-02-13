#ifndef WALLOC_H_
#define WALLOC_H_

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

__attribute__((visibility("default"))) void* malloc(size_t size);
__attribute__((visibility("default"))) void free(void *ptr);

#ifdef __cplusplus
}
#endif

#endif // WALLOC_H_

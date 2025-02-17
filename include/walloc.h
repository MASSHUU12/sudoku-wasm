#ifndef WALLOC_H_
#define WALLOC_H_

#include <stddef.h>

#ifdef __cplusplus
extern "C" {
#endif

void *malloc(size_t size);
void free(void *ptr);

#ifdef __cplusplus
}
#endif

#endif // WALLOC_H_

#ifndef RAND_H_
#define RAND_H_

#include <stdint.h>

extern uint32_t seed;

#ifdef __cplusplus
extern "C" {
#endif

uint32_t lcg(void);

int32_t random(const int32_t min, const int32_t max);

#ifdef __cplusplus
}
#endif

#endif // RAND_H_

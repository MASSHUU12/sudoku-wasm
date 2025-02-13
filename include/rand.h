#ifndef RAND_H_
#define RAND_H_

#include <stdint.h>

extern uint32_t seed;

uint32_t lcg();

int random(int min, int max);

#endif // RAND_H_

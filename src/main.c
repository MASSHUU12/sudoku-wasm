#include <stdint.h>
#include <stddef.h>
#include "rand.h"

uint32_t seed;

void setup(uint32_t new_seed) {
  seed = new_seed;
}

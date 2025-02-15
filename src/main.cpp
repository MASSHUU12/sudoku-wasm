#include <stdint.h>
#include <stddef.h>
#include "rand.h"

uint32_t seed{};

extern "C" {
void setup(uint32_t new_seed) {
  seed = new_seed;
}
}

#include "rand.h"

uint32_t lcg(void) {
  seed = (1103515245 * seed + 12345) % 2147483648;
  return seed;
}

int random(const int min, const int max) {
  return lcg() % (max - min + 1) + min;
}

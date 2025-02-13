#include "rand.h"

uint32_t lcg() {
  seed = (1103515245 * seed + 12345) % 2147483648;
  return seed;
}

int random(int min, int max) {
  return lcg() % (max - min + 1) + min;
}

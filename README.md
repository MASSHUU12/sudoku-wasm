# Sudoku WebAssembly

## Requirements

- A C++ compiler.

## Build Instructions

1. Clone the repository:
```bash
git clone git@github.com:MASSHUU12/sudoku-wasm.git
cd sudoku-wasm
```

2. Create a build directory and navigate into it:
```bash
mkdir build && cd build
```
3. Run CMake to configure the build:
```bash
cmake .. # cmake -DCMAKE_BUILD_TYPE=Release ..
```

4. Build and run the newly created executable:
```bash
make
```

5. Run basic web server:
```bash
make serve # uses python3
```

## License

Licensed under [MIT license](./LICENSE).

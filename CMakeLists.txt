cmake_minimum_required(VERSION 3.13)
project(sudoku-wasm C)

set(CMAKE_C_COMPILER clang)

set(CMAKE_C_STANDARD 23)
set(CMAKE_C_STANDARD_REQUIRED ON)

set(CMAKE_C_FLAGS "${CMAKE_C_FLAGS} --target=wasm32 -flto -nostdlib -fno-builtin-memset -Wall -Wextra -Wpedantic -std=c23")
set(CMAKE_EXE_LINKER_FLAGS "${CMAKE_EXE_LINKER_FLAGS} -Wl,--no-entry -Wl,--export-all -Wl,--lto-O3 -Wl,-z,stack-size=8388608 -Wl,--allow-undefined")

# Set flags for each build type
set(CMAKE_C_FLAGS_DEBUG "${CMAKE_C_FLAGS} -O0 -g")
set(CMAKE_C_FLAGS_RELEASE "${CMAKE_C_FLAGS} -O3")

# Linker flags for each configuration
set(CMAKE_EXE_LINKER_FLAGS_DEBUG "${CMAKE_EXE_LINKER_FLAGS}")
set(CMAKE_EXE_LINKER_FLAGS_RELEASE "${CMAKE_EXE_LINKER_FLAGS} -Wl,--lto-O3")

set(CMAKE_EXPORT_COMPILE_COMMANDS ON)

# Provide default build type if none is specified.
if(NOT CMAKE_BUILD_TYPE)
    set(CMAKE_BUILD_TYPE "Debug" CACHE STRING "Choose the build type (e.g., Release or Debug)" FORCE)
endif()

# Main target
add_executable(sudoku-wasm
    src/str.c
    src/main.c
    src/rand.c
    src/walloc.c
    src/memory.c
    src/sudoku.c
)

target_include_directories(sudoku-wasm PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
)

set_target_properties(sudoku-wasm PROPERTIES
    RUNTIME_OUTPUT_DIRECTORY "${CMAKE_CURRENT_SOURCE_DIR}/web"
    OUTPUT_NAME "main"
    SUFFIX ".wasm"
)

# Custom target to generate a .wat file from the wasm
add_custom_target(
    wat
    COMMAND wasm2wat "$<TARGET_FILE:sudoku-wasm>" > "${CMAKE_CURRENT_SOURCE_DIR}/main.wat"
    DEPENDS sudoku-wasm
    COMMENT "Converting main.wasm to main.wat"
)

# Custom target to serve the ./web directory using Python
add_custom_target(
    serve
    COMMAND python3 -m http.server -d "${CMAKE_CURRENT_SOURCE_DIR}/web"
    DEPENDS sudoku-wasm
    COMMENT "Serving ./web directory on localhost"
)

# Custom target to clean generated artifacts
# (Note: The default "make clean" or "ninja clean" only removes CMake build files)
add_custom_target(
    clean-artifacts
    COMMAND ${CMAKE_COMMAND} -E remove *.wasm *.wat "${CMAKE_CURRENT_SOURCE_DIR}/web/*.wasm" "${CMAKE_CURRENT_SOURCE_DIR}/web/*.wat"
    COMMENT "Removing generated .wasm and .wat files"
)

SRC = src/main.c src/gl_basic.c
EMSCRIPTEN_SETTINGS=-s EXPORTED_RUNTIME_METHODS=[ccall] -sALLOW_MEMORY_GROWTH -s USE_SDL=2 --preload-file res
web: $(SRC)
	emcc $(EMSCRIPTEN_SETTINGS) -Iinc $(SRC) -Wall -O3 -o docs/index.html --shell-file src/shell.html
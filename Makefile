SRC = src/main.c
OBJ = $(SRC:.c=.o)
EMSCRIPTEN_SETTINGS=-s EXPORTED_RUNTIME_METHODS=[ccall] -sALLOW_MEMORY_GROWTH -s USE_SDL=2 --preload-file res
web: $(SRC)
	emcc $(EMSCRIPTEN_SETTINGS) -Iinc $(SRC) -Wall -O2 -o index.html --shell-file shell.html
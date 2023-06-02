SRC = src/main.c src/gl_basic.c
EMSCRIPTEN_SETTINGS=-s EXPORTED_RUNTIME_METHODS=[ccall] -sALLOW_MEMORY_GROWTH -s USE_SDL=2 -s USE_SDL_IMAGE=2 -s SDL2_IMAGE_FORMATS='["jpg"]' --use-preload-plugins --preload-file res
web: $(SRC)
	emcc $(EMSCRIPTEN_SETTINGS) -Iinc $(SRC) -Wall -O0 -o docs/index.html --shell-file src/shell.html
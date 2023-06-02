SRC = $(wildcard src/*.c)

OBJ_DIR = obj
CFLAGS = -Wall -O0
OBJ = $(addprefix $(OBJ_DIR)/, $(notdir $(SRC:.c=.o)))

EMSCRIPTEN_SETTINGS=-s EXPORTED_FUNCTIONS='["_main", "_malloc", "_free"]' \
                    -s EXPORTED_RUNTIME_METHODS=[ccall] \
                    -s ALLOW_MEMORY_GROWTH \
                    -s USE_SDL=2 \
                    -s USE_SDL_IMAGE=2 \
                    -s SDL2_IMAGE_FORMATS='["jpg"]' \
                    --use-preload-plugins \
                    --preload-file res

web: docs/index.html

$(OBJ_DIR)/%.o: src/%.c
	mkdir -p $(OBJ_DIR)
	emcc -Iinc $(CFLAGS) -c $< -o $@

docs/index.html: $(OBJ)
	emcc $(EMSCRIPTEN_SETTINGS) \
	     -Iinc $(OBJ) $(CFLAGS) \
	     -o docs/index.html \
	     --shell-file src/shell.html

clean:
	rm -f $(OBJ) docs/index.*
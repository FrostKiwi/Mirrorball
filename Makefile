SRC = $(wildcard src/*.c)

CFLAGS = -Wall -O3
OBJ = $(addprefix obj/, $(notdir $(SRC:.c=.o)))

EMSCRIPTEN_SETTINGS=-s EXPORTED_FUNCTIONS='["_main", "_malloc", "_free"]' \
                    -s EXPORTED_RUNTIME_METHODS=[ccall] \
                    -s ALLOW_MEMORY_GROWTH \
                    -s USE_SDL=2 \
                    -s USE_SDL_IMAGE=2 \
                    -s SDL2_IMAGE_FORMATS='["jpg"]' \
                    --use-preload-plugins \
                    --preload-file res

web: out/index.html

obj/%.o: src/%.c
	mkdir -p obj
	emcc -Iinc $(CFLAGS) -c $< -o $@

out/index.html: $(OBJ)
	emcc $(EMSCRIPTEN_SETTINGS) \
	     -Iinc $(OBJ) $(CFLAGS) \
	     -o out/index.html \
	     --shell-file src/shell.html

clean:
	rm -f $(OBJ) out/index.*
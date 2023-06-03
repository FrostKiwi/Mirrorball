SRC = $(wildcard src/*.c)

release: CFLAGS = -Wall -O3
debug: CFLAGS = -v -Wall -O0
OBJ = $(addprefix obj/, $(notdir $(SRC:.c=.o)))

EMCC_FLAGS= -s USE_SDL=2 \
			-s USE_SDL_IMAGE=2 \
			-s SDL2_IMAGE_FORMATS='["jpg"]' \

EMCC_LINKER_FLAGS= $(EMCC_FLAGS) \
				   -s EXPORTED_FUNCTIONS='["_main", "_malloc", "_free"]' \
				   -s EXPORTED_RUNTIME_METHODS=[ccall] \
				   -s ALLOW_MEMORY_GROWTH \
				   --use-preload-plugins \
				   --preload-file res

release debug: out/index.html

obj/%.o: src/%.c
	mkdir -p obj
	emcc $(EMCC_FLAGS) -Iinc $(CFLAGS) -c $< -o $@

out/index.html: $(OBJ)
	emcc $(EMCC_LINKER_FLAGS) \
		 -Iinc $(OBJ) $(CFLAGS) \
		 -o out/index.html \
		 --shell-file src/shell.html

run:
	emrun out/index.html

clean:
	rm -f $(OBJ) out/index.*

.PHONY: clean run
SRC = $(wildcard src/*.c)

release: CFLAGS = -Wall -O3 -flto # O3 + LTO
debug: CFLAGS = -Wall -O0
OBJ = $(addprefix obj/, $(notdir $(SRC:.c=.o)))
PROTECT = ["_load_file", "_main", "_malloc", "_free"]

# List resource directories manually, instead of a recursive find to prevent
# dumb edge cases, because Linux and Windows find are called the same but work
# differently.
CAUSE_FOR_RECOMPILE = $(wildcard inc/*.h) \
					  $(wildcard res/*) \
					  $(wildcard res/shd/*) \
					  $(wildcard res/img/*) \
					  $(wildcard res/font/*) \
					  Makefile

EMCC_FLAGS= -s USE_SDL=2 \
			-s USE_SDL_IMAGE=2 \
			-s SDL2_IMAGE_FORMATS='["jpg", "png", "heic"]'

EMCC_LINKER_FLAGS = $(EMCC_FLAGS) \
					-s EXPORTED_FUNCTIONS='$(PROTECT)' \
					-s EXPORTED_RUNTIME_METHODS=[ccall] \
					-s ALLOW_MEMORY_GROWTH \
					--use-preload-plugins \
					--preload-file res \
					-Wl,-u,fileno

release debug: out/index.html $(OBJ)

out/index.html: $(OBJ)
	emcc $(EMCC_LINKER_FLAGS) \
		 -Iinc $(OBJ) $(CFLAGS) \
		 -o out/index.html \
		 --shell-file src/shell.html

# Changes to the headers, Makefile or shaders as cause to recompile everything
obj/%.o: src/%.c $(CAUSE_FOR_RECOMPILE)
	mkdir -p obj
	emcc $(EMCC_FLAGS) -Iinc $(CFLAGS) -c $< -o $@

run:
	emrun out/index.html

clean:
	rm -f $(OBJ) out/index.*

.PHONY: clean run
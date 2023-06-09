SRC = $(wildcard src/*.c)

release: CFLAGS = -Wall -O3 -flto # O3 + LTO
debug: CFLAGS = -Wall -O0
OBJ = $(addprefix obj/, $(notdir $(SRC:.c=.o)))
# Functions to be prevented from being deleted as dead code. This is to allow
# for C code to be alled from Javascript, even when the functions in question
# are not called in the C code itself. Other options is EMSCRIPTEN_KEEPALIVE,
# but that doesn't for for things not defined in the C source like malloc.
PROTECT = ["_load_photo", "_main", "_malloc", "_free"]

# List resource directories manually, instead of a recursive find to prevent
# dumb edge cases, because Linux and Windows find are called the same but work
# differently.
CAUSE_FOR_RECOMPILE = $(wildcard inc/*.h) \
					  $(wildcard res/*) \
					  $(wildcard res/shd/*) \
					  $(wildcard res/img/*) \
					  $(wildcard res/font/*) \
					  $(wildcard src/web/*) \
					  Makefile

# These emscripten flags need to be present during compilation, because this
# triggers the package manager to download everything that's needed like SDL and
# the associated dependencies.
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

# Linking Stage + Output to WASM.
out/index.html: $(OBJ)
	@echo
	@echo -e "\033[96m-- Linking stage --\033[0m"
	@mkdir -p out
	emcc $(EMCC_LINKER_FLAGS) \
		 -Iinc $(OBJ) $(CFLAGS) \
		 -o out/index.html \
		 --shell-file src/web/shell.html
	cp src/web/* out

# Compile every C file in parallel.
# Changes to the headers, Makefile or shaders as cause to recompile everything
obj/%.o: src/%.c $(CAUSE_FOR_RECOMPILE)
	@echo -e "\033[96m-- Compiling: $< --\033[0m"
	@mkdir -p obj
	emcc $(EMCC_FLAGS) -Iinc $(CFLAGS) -c $< -o $@
	
run:
	emrun out/index.html

clean:
	rm -f $(OBJ) out/index.*

.PHONY: clean run
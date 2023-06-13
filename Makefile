#      __     ___           _ _       __  __       _         __ _ _            #
#      \ \   / / | __ _  __| ( )___  |  \/  | __ _| | _____ / _(_) | ___       #
#       \ \ / /| |/ _` |/ _` |// __| | |\/| |/ _` | |/ / _ \ |_| | |/ _ \      #
#        \ V / | | (_| | (_| | \__ \ | |  | | (_| |   <  __/  _| | |  __/      #
#         \_/  |_|\__,_|\__,_| |___/ |_|  |_|\__,_|_|\_\___|_| |_|_|\___|      #

# ========= Settings ========= #
release: CFLAGS = -Wall -O3 -flto # O3 + LTO
debug: CFLAGS = -Wall -O0

# Functions to be prevented from being deleted as dead code. This is to allow
# for C code to be alled from Javascript, even when the functions in question
# are not called in the C code itself. Other options is EMSCRIPTEN_KEEPALIVE,
# but that doesn't for for things not defined in the C source like malloc.
PROTECT = ["_process_webcam", "_setup_webcam", "_load_photo", "_main", "_malloc", "_free"]

# If any of these files change, recompile everything
# Consider the Makefile and headers
CAUSE_FOR_RECOMPILE = $(wildcard inc/*.h) \
					  $(wildcard inc/nuklear/*.h)

# If any of these files change, just relink
# Consider src/web and resources
CAUSE_FOR_RELINKING = $(wildcard src/web/*) \
					  $(wildcard src/web/js/*) \
					  $(wildcard res/*) \
					  $(wildcard res/img/*) \
					  $(wildcard res/shd/*) \
					  $(wildcard res/font/*)

# These emscripten flags need to be present during compilation, because this
# triggers the package manager to download everything that's needed like SDL and
# the associated dependencies.
EMCC_FLAGS= -s USE_SDL=2 \
			-s USE_SDL_IMAGE=2 \
			-s SDL2_IMAGE_FORMATS='["jpg", "png", "heic"]' \

# Pull javascript through the emscripten optimizer pipeline
JS_FILES= --extern-pre-js=src/web/js/shell.js \
		  --pre-js=src/web/js/userfile.js \
		  --pre-js=src/web/js/webcam.js \
		  --pre-js=src/web/js/video.js \
		  --pre-js=src/web/js/videofile.js

# -Wl,-u,fileno is a workaround for an outstanding issue with LTO and emscripten
# LTO is mega awesome, but the interaction with javascript causes it to
# optimize away needed symbols, requiring an exception.
EMCC_LINKER_FLAGS = $(EMCC_FLAGS) \
					-s EXPORTED_FUNCTIONS='$(PROTECT)' \
					-s EXPORTED_RUNTIME_METHODS=[ccall] \
					-s ALLOW_MEMORY_GROWTH \
					$(JS_FILES) \
					--use-preload-plugins \
					--preload-file res \
					-Wl,-u,fileno

# ========= Implementation ========= #
# Source files are all .c files under src
SRC = $(shell find src -type f -name '*.c')
OBJ = $(patsubst src/%.c, obj/%.o, $(SRC))

# Include files for Nuklear were moved into their own folder, so two includes
# are needed
INC = -Iinc -Iinc/nuklear

release debug: out/index.html

# Linking Stage + Output to WASM.
out/index.html: $(OBJ) $(CAUSE_FOR_RELINKING)
	@echo
	@echo -e "\033[96m-- Linking stage --\033[0m"
	@mkdir -p out
	emcc $(EMCC_LINKER_FLAGS) \
		 $(OBJ) $(CFLAGS) \
		 -o out/index.html \
		 --shell-file src/web/shell.html
	cp src/web/favicon.svg src/web/shell.css out/

# Compile every C file in parallel.
# Changes to the headers, Makefile or shaders as cause to recompile everything
obj/%.o: src/%.c $(CAUSE_FOR_RECOMPILE)
	@echo -e "\033[96m-- Compiling: $< --\033[0m"
	@mkdir -p obj/nuklear
	emcc $(EMCC_FLAGS) $(INC) $(CFLAGS) -c $< -o $@
	
run:
	emrun out/index.html

clean:
	rm -rf obj/* out/*

.PHONY: clean run
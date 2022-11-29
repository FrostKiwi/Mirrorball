SRC = src/main.c src/stb_image.c
OBJ = $(SRC:.c=.o)

web: $(SRC)
	emcc -sALLOW_MEMORY_GROWTH -Iinc $(SRC) -O0 -g -s USE_SDL=2 -o index.html
CC=cc
CFLAGS=-pipe -Ofast -s -flto -Wall $$(pkg-config --cflags glfw3 cglm libavformat libavcodec libavutil) -DGLEW_STATIC
INC=-I inc
LIBS=-lopengl32 -lole32 -lgdi32 -luuid -lpthread -ldl -lm $$(pkg-config --libs glfw3 cglm libavcodec libavformat libavutil)
EXTRA=lib/windows_icon.res lib/windows_version.res lib/windows_libnfd.a
# If resources are present, generate the resource file res.o
ifneq (,$(shell find res -type f | tr '\n' ' '))
RES=obj/res.o
endif

### Linking ###
build: $(patsubst src/%.c,obj/%.o,$(wildcard src/*.c)) $(RES) $(EXTRA)
	@echo -e " \033[96m-- linking binary --\033[0m"
	$(CC) -o bin/main $^ $(CFLAGS) $(LIBS)

### Compiling ###
obj/%.o: $(patsubst obj/%.o, src/%.c, obj/%.o) inc/*.h $(RES)
	@mkdir -p obj
	@echo -e " \033[96m-- compiling $< --\033[0m"
	$(CC) -c $< -o $@ $(INC) $(CFLAGS)

### BIG BOY resource handler <3 ###
# Get just the size lines from nm
NM_SIZE=nm -t d --format=posix obj/res.o | sed '/_size A /!d'
# Format size lines to be definitions of resource structs
NM_STRUCT=$$($(NM_SIZE) | sed -e 's/size A /start, /' -e 's/$$/};/' -e 's/.*_start, /&= { &/' -e 's/_start, =/ =/' -e 's/^.\{8\}//' -e 's/^/static struct resource /')
# Format size lines to get extern definitions
NM_EXTERN=$$($(NM_SIZE) | sed -e 's/_size .*/_start[];/' -e 's/^/extern const char /')
# Struct definition
RES_STRUCT=struct resource { const char * pnt; const int size; };\n
# File Message
RES_MSG=/* auto-generated resource handler, kinda awesome :] */
# Git log info of last commit
GIT_AUTHOR=static const char * LAST_COMMIT_AUTHOR = \"$(shell git log -1 --pretty=format:%an)\";
GIT_DATE=static const char * LAST_COMMIT_DATE = \"$(shell git log -1 --pretty=format:%ad --date=format:'%Y.%m.%d %H:%M')\";
GIT_MSG=static const char * LAST_COMMIT_MSG = \"$(shell git log -1 --pretty=%B)\";

obj/res.o: $(shell find res -type f | tr '\n' ' ')
	@mkdir -p obj
	@echo -e "\033[96m-- Updating resources --\033[0m"
#	cd first, to prevent ld from generating _res_ prefixes
	cd res; ld -r -b binary $(shell cd res; find * -type f | tr '\n' ' ') -o ../$@
	@stat -c "%s" obj/res.o | numfmt --to=iec | xargs -0 printf "\033[92mResource name list\033[0m - total resource binary size: %s"
	@nm $@ | sed -E '/size$$/d;s/[^ ]* D* //;s/_binary_//;s/_end//;s/_start//' | sed -n 'n;p' | xargs -0 printf "\033[94m%s\033[0m"
	@echo -e "$(RES_MSG)\n\n#ifndef RESDEF\n#define RESDEF\n$(GIT_AUTHOR)\n$(GIT_DATE)\n$(GIT_MSG)\n\n$(RES_STRUCT)\n\n$(NM_EXTERN)\n\n$(NM_STRUCT)\n#endif" > inc/res.h

.PHONY: clean run
run:
	@bin/main
clean:
	@echo *scrub scrub*
	rm -f bin/* obj/* inc/res.h

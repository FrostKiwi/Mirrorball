#include <stdlib.h>
#include <string.h>
#include <assert.h>
#include <math.h>
#define M_PI 3.14159265358979323846
#include <limits.h>
#include <time.h>
#include <stdbool.h>

#define NK_INCLUDE_FIXED_TYPES
#define NK_INCLUDE_STANDARD_IO
#define NK_INCLUDE_STANDARD_VARARGS
#define NK_INCLUDE_DEFAULT_ALLOCATOR
#define NK_INCLUDE_VERTEX_BUFFER_OUTPUT
#define NK_INCLUDE_FONT_BAKING
#include "nuklear.h"
#include "nuklear_sdl_gles2.h"
#include "main.h"
#include "init.h"

int main(int argc, char *argv[])
{
	struct global_context gctx = {
		.fovmin = 10 * GLM_PIf / 180.0f,
		.fovmax = 140 * GLM_PIf / 180.0f,
		.fov = 100 * GLM_PIf / 180.0f,
		.ch1.fov_deg = 360,
		.projection = false,
		.interface_mult = 1};
	/* GUI */
	SDL_GLContext glContext;

	/* SDL setup */
	SDL_SetHint(SDL_HINT_VIDEO_HIGHDPI_DISABLED, "1");
	SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);

	/* Window size doesn't really matter here, since the HTML canvas determines
	   the size. But still, it is recommended to keep a default size */
	gctx.win = SDL_CreateWindow("Frost-O-Rama",
								SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
								800, 600,
								SDL_WINDOW_OPENGL |
									SDL_WINDOW_SHOWN |
									SDL_WINDOW_RESIZABLE); /* |
								   SDL_WINDOW_ALLOW_HIGHDPI */
	glContext = SDL_GL_CreateContext(gctx.win);

	/* OpenGL setup */
	glClearColor(0, 0, 0, 1);
	/* Prevents headaches when loading NPOT textures */
	glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
	glPixelStorei(GL_PACK_ALIGNMENT, 1);

	gctx.ctx = nk_sdl_init(gctx.win);

	gctx.ch1.img = load_texture("res/img/room.jpg", gctx.ch1.img);
	gctx.fov = glm_rad(100);
	gctx.camera_rotation[1] = 1.5;
	gctx.ch1.crop.top = 46;
	gctx.ch1.crop.bot = 62;
	gctx.ch1.crop.left = 45;
	gctx.ch1.crop.right = 63;
	gctx.ch1.fov_deg = 342;

	/* Setup Shaders */
	gctx.crop_shader.shader = compile_shader("res/shd/crop.vs", "res/shd/crop.fs");
	gctx.projection_shader.shader = compile_shader("res/shd/project.vs", "res/shd/project.fs");

	float unitquadtex[] = {
		-1.0, 1.0, 0.0, 0.0,
		1.0, 1.0, 1.0, 0.0,
		1.0, -1.0, 1.0, 1.0,
		-1.0, -1.0, 0.0, 1.0};

	glGenBuffers(1, &gctx.bgvbo);
	glBindBuffer(GL_ARRAY_BUFFER, gctx.bgvbo);
	glBufferData(GL_ARRAY_BUFFER, sizeof(unitquadtex), unitquadtex, GL_STATIC_DRAW);
	glBindBuffer(GL_ARRAY_BUFFER, 0);

	glGenBuffers(1, &gctx.rayvbo);

	gctx.crop_shader.pos = glGetAttribLocation(gctx.crop_shader.shader, "pos");
	gctx.crop_shader.coord = glGetAttribLocation(gctx.crop_shader.shader, "coord");
	gctx.crop_shader.aspect_w = glGetUniformLocation(gctx.crop_shader.shader, "aspect_w");
	gctx.crop_shader.aspect_h = glGetUniformLocation(gctx.crop_shader.shader, "aspect_h");
	gctx.crop_shader.crop = glGetUniformLocation(gctx.crop_shader.shader, "crop");

	gctx.projection_shader.pos = glGetAttribLocation(gctx.projection_shader.shader, "pos");
	gctx.projection_shader.viewray = glGetAttribLocation(gctx.projection_shader.shader, "rayvtx");
	gctx.projection_shader.scaler = glGetUniformLocation(gctx.projection_shader.shader, "scalar");
	gctx.projection_shader.crop = glGetUniformLocation(gctx.projection_shader.shader, "crop");

	gctx.interface_mult = 1.4;

	gctx.ctx->style.scrollv.rounding_cursor = 12 * gctx.interface_mult;
	gctx.ctx->style.scrollv.rounding = 12 * gctx.interface_mult;
	gctx.ctx->style.property.rounding = 12 * gctx.interface_mult;
	gctx.ctx->style.window.scrollbar_size = nk_vec2(24 * gctx.interface_mult, 24 * gctx.interface_mult);
	init_fonts(&gctx);

	emscripten_set_main_loop_arg(MainLoop, (void *)&gctx, 0, nk_true);

	nk_sdl_shutdown();
	SDL_GL_DeleteContext(glContext);
	SDL_DestroyWindow(gctx.win);
	SDL_Quit();
	return 0;
}

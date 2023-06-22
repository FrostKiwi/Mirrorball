#include "main.h"
#include "init.h"

/* Make struct global, to make the symbol accessible across all translation
   units, which are called by the EMscripten java script. */
struct global_context gctx = {
	.cam.fovmin = 10.f * GLM_PIf / 180.0f,
	.cam.fovmax = 140.f * GLM_PIf / 180.0f,
	.cam.fov = 100.f * GLM_PIf / 180.0f,
	.ch1.fov_deg = 360,
	.interface_mult = 1,
	.ch1.viewrays = {
		-1.0, 1.0, 0.0, 0.0, 0.0,
		1.0, 1.0, 0.0, 0.0, 0.0,
		1.0, -1.0, 0.0, 0.0, 0.0,
		-1.0, -1.0, 0.0, 0.0, 0.0}};

void reset_image()
{
	gctx.cam.cam_rotation = vec3_zero();
	gctx.ch1.rotation = vec3_zero();
	gctx.ch1.fov_deg = 360;
	gctx.cam.fov = glm_rad(100);
	gctx.ch1.crop.bot = 0;
	gctx.ch1.crop.top = 0;
	gctx.ch1.crop.left = 0;
	gctx.ch1.crop.right = 0;
}

int main(int argc, char *argv[])
{
	/* GUI */
	SDL_GLContext glContext;

	/* SDL setup */
	SDL_SetHint(SDL_HINT_VIDEO_HIGHDPI_DISABLED, "0");
	SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);

	/* Window size doesn't really matter here, since the HTML canvas determines
	   the size. But still, it is recommended to keep a default size */
	gctx.win = SDL_CreateWindow("Frost-O-Rama",
								SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
								800, 600,
								SDL_WINDOW_OPENGL |
									SDL_WINDOW_SHOWN |
									SDL_WINDOW_RESIZABLE |
									SDL_WINDOW_ALLOW_HIGHDPI);
	glContext = SDL_GL_CreateContext(gctx.win);

	/* Set basic GL info to prevent calling it every frame */
	print_glinfo();
	gctx.debug.gl.version = (const char *)glGetString(GL_VERSION);
	gctx.debug.gl.vendor = (const char *)glGetString(GL_VENDOR);
	gctx.debug.gl.renderer = (const char *)glGetString(GL_RENDERER);
	gctx.debug.gl.glsl = (const char *)glGetString(GL_SHADING_LANGUAGE_VERSION);
	glGetIntegerv(GL_MAX_TEXTURE_SIZE, &gctx.debug.gl.max_tex);

	/* Copy Extensions string, replace spaces with nulls and count extensions */
	int ext_strlen = strlen((const char *)glGetString(GL_EXTENSIONS));
	gctx.debug.gl.extension_count = (ext_strlen) ? 1 : 0;
	gctx.debug.gl.extensions = malloc(ext_strlen + 1);
	strcpy(gctx.debug.gl.extensions, (const char *)glGetString(GL_EXTENSIONS));

	for (int i = 0; i < ext_strlen; ++i)
	{
		if (gctx.debug.gl.extensions[i] == ' ')
		{
			gctx.debug.gl.extensions[i] = '\0';
			gctx.debug.gl.extension_count++;
		}
	}

	/* OpenGL setup */
	glClearColor(0, 0, 0, 1);
	/* Prevents headaches when loading NPOT textures */
	glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
	glPixelStorei(GL_PACK_ALIGNMENT, 1);

	gctx.ctx = nk_sdl_init(gctx.win);

	/* gctx.ch1.img = load_texture("res/img/room.jpg", gctx.ch1.img); */
	EM_ASM(load_from_url("img/room.jpg"););
	gctx.cam.fov = glm_rad(100);
	gctx.cam.cam_rotation.y = 1.5;
	gctx.ch1.crop.top = 46;
	gctx.ch1.crop.bot = 62;
	gctx.ch1.crop.left = 45;
	gctx.ch1.crop.right = 63;
	gctx.ch1.fov_deg = 342;

	gctx.ctx->style.scrollv.rounding_cursor = 12 * gctx.interface_mult;
	gctx.ctx->style.scrollv.rounding = 12 * gctx.interface_mult;
	gctx.ctx->style.property.rounding = 12 * gctx.interface_mult;
	gctx.ctx->style.window.scrollbar_size = nk_vec2(24 * gctx.interface_mult,
													24 * gctx.interface_mult);
	init_fonts();
	init_shaders();

	emscripten_set_main_loop_arg(render_loop, NULL, 0, nk_true);

	nk_sdl_shutdown();
	SDL_GL_DeleteContext(glContext);
	SDL_DestroyWindow(gctx.win);
	SDL_Quit();
	return 0;
}

#ifndef MAIN_H
#define MAIN_H

/* Platform requirements */
#include <SDL2/SDL.h>
#include <emscripten.h>

/* External headers */
#include "nuklear.h"
#include "nuklear_sdl_gles2.h"

#define CGLM_OMIT_NS_FROM_STRUCT_API
#include "cglm/struct.h"

/* Internal Headers */
#include "gl_basic.h"
#include "util.h"

struct font
{
	struct nk_user_font *handle;
	nk_rune *ranges;
};

struct channel
{
	struct image img;
	unsigned char *data;
	struct
	{
		int top;
		int bot;
		int left;
		int right;
	} crop;

	float fov_deg;
	float fov;
	vec3s rotation;

	float viewrays[20];
};

struct global_context
{
	SDL_Window *win;
	struct nk_context *ctx;
	struct font std;
	struct font big;
	struct font icons;

	struct channel ch1;

	nk_bool mask_toggle;
	nk_bool vizualize;

	struct
	{
		GLuint shader;
		GLint vtx;
		GLint coord;
		GLint aspect_w;
		GLint aspect_h;
		GLint crop;
		GLint mask_toggle;
	} crop_shader;
	struct
	{
		GLuint shader;
		GLint pos;
		GLint viewray;
		GLint crop;
		GLint scaler;
	} projection_shader;
	struct
	{
		GLuint shader;
		GLuint quadvbo;
		GLint vtx;
		GLint aspect_w;
		GLint aspect_h;
		GLint scale;
		GLint transform;
		GLint color;
	} border_shader;

	/* Camera struct */
	struct
	{
		vec3s cam_rotation;
		mat4s cam_rotation_matrix;
		mat4s view_matrix;
		mat4s projection_matrix;
		float fov;
		float fovmin;
		float fovmax;
	} cam;

	struct
	{
		struct
		{
			const char *version;
			const char *vendor;
			const char *renderer;
			const char *glsl;
			char *extensions;
			int extension_count;
			int max_tex;
		} gl;

		struct
		{
			/* 1 SDL Tick = 1ms */
			Uint32 ticks_prev;
			Uint32 ticks_cur;
			Uint32 ms_cur;
			float ms_fading;
		} time;
	} debug;

	GLuint bgvbo;
	GLuint rayvbo;
	bool projection;
	float interface_mult;
};

extern struct global_context gctx;

void render_loop(void *loopArg);
void reset_image();
#endif
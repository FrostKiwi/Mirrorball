#include <stdio.h>
#include <stdlib.h>
#include <stdint.h>
#include <stdarg.h>
#include <string.h>
#include <math.h>
#define M_PI 3.14159265358979323846
#include <assert.h>
#include <limits.h>
#include <time.h>
#include <stdbool.h>

#define NK_INCLUDE_FIXED_TYPES
#define NK_INCLUDE_STANDARD_IO
#define NK_INCLUDE_STANDARD_VARARGS
#define NK_INCLUDE_DEFAULT_ALLOCATOR
#define NK_INCLUDE_VERTEX_BUFFER_OUTPUT
#define NK_INCLUDE_FONT_BAKING
#define NK_IMPLEMENTATION
#define NK_SDL_GLES2_IMPLEMENTATION
#include "nuklear.h"
#include "nuklear_sdl_gles2.h"

#include "cglm/cglm.h"

#include <emscripten.h>
#define STB_IMAGE_IMPLEMENTATION
#include "stb_image.h"

float unitquadtex[] = {
	-1.0, 1.0, 0.0, 0.0,
	1.0, 1.0, 1.0, 0.0,
	1.0, -1.0, 1.0, 1.0,
	-1.0, -1.0, 0.0, 1.0};

float viewrays[] = {
	-1.0, 1.0, 0.0, 0.0, 0.0,
	1.0, 1.0, 0.0, 0.0, 0.0,
	1.0, -1.0, 0.0, 0.0, 0.0,
	-1.0, -1.0, 0.0, 0.0, 0.0};

/* Just pasted in shaders in code for now, pretty ugly :[ */
static const GLchar *crop_vs =
	"#version 100\n"
	"varying vec2 tex;\n"
	"uniform float aspect_w;\n"
	"uniform float aspect_h;\n"
	"uniform vec4 crop;\n"
	"attribute vec2 pos;\n"
	"attribute vec2 coord;\n"
	"void main()\n"
	"{\n"
	"    tex = coord * vec2(crop.z, crop.w) + vec2(crop.x, crop.y);\n"
	"    gl_Position = vec4(pos.x * aspect_w,\n"
	"		       pos.y * aspect_h, 0.0, 1.0);\n"
	"}\n";

static const GLchar *crop_fs =
	"#version 100\n"
	"precision mediump float;\n"
	"varying vec2 tex;\n"
	"uniform sampler2D sample;\n"
	"void main()\n"
	"{\n"
	"    gl_FragColor = texture2D(sample, tex);\n"
	"}\n";

static const GLchar *proj_vs =
	"#version 100\n"
	"attribute vec2 pos;\n"
	"attribute vec3 rayvtx;\n"
	"varying vec3 Ray;\n"
	"void main()\n"
	"{\n"
	"    Ray = rayvtx;\n"
	"    gl_Position = vec4(pos, 1.0, 1.0);\n"
	"}\n";
static const GLchar *proj_fs =
	"#version 100\n"
	"#define M_2SQRT2 2.8284271247461900976033774484194\n"
	"precision highp float;\n"
	"varying vec3 Ray;\n"
	"uniform vec4 crop;\n"
	"uniform float scalar;\n"
	"uniform sampler2D sample_projection;\n"
	"void main()\n"
	"{\n"
	"    vec3 R = normalize(Ray);\n"
	"    vec2 uv = scalar * R.xy / (M_2SQRT2 * sqrt(R.z + 1.0));\n"
	"    if(length(uv) >= 0.5) gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);\n"
	"    else{\n"
	"	uv *= vec2(crop.z, crop.w);\n"
	"	uv.x = crop.x + uv.x;\n"
	"	uv.y = crop.y - uv.y;\n"
	"	gl_FragColor = texture2D(sample_projection, uv);\n"
	"    }\n"
	"}\n";

GLuint compile_shader(const char **vert_shader_source,
					  const char **fragment_shader_source)
{
	char log[512];
	GLuint fragment_shader, shader_program, vertex_shader;
	GLint success;
	/* Vertex shader */
	vertex_shader = glCreateShader(GL_VERTEX_SHADER);
	glShaderSource(vertex_shader, 1, vert_shader_source, 0);
	glCompileShader(vertex_shader);
	glGetShaderiv(vertex_shader, GL_COMPILE_STATUS, &success);
	if (!success)
	{
		glGetShaderInfoLog(vertex_shader, 512, NULL, log);
		printf("Error! Vertex shader compilation failed!\n%s\n", log);
	}
	/* Fragment shader */
	fragment_shader = glCreateShader(GL_FRAGMENT_SHADER);
	glShaderSource(fragment_shader, 1, fragment_shader_source, 0);
	glCompileShader(fragment_shader);
	glGetShaderiv(fragment_shader, GL_COMPILE_STATUS, &success);
	if (!success)
	{
		glGetShaderInfoLog(fragment_shader, 512, NULL, log);
		printf("Error! Fragment shader compilation failed!\n%s\n", log);
	}
	/* Link shaders */
	shader_program = glCreateProgram();
	glAttachShader(shader_program, vertex_shader);
	glAttachShader(shader_program, fragment_shader);
	glLinkProgram(shader_program);
	glGetProgramiv(shader_program, GL_LINK_STATUS, &success);
	if (!success)
	{
		glGetProgramInfoLog(shader_program, 512, NULL, log);
		printf("Error! Shader linking failed!\n%s\n", log);
	}
	/* Cleanup */
	glDeleteShader(vertex_shader);
	glDeleteShader(fragment_shader);
	return shader_program;
}

struct font
{
	struct nk_user_font *handle;
	nk_rune *ranges;
};

struct image
{
	int width, height, channels;
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
	vec3 rotation;
	GLuint tex;
};

struct
{
	struct font std;
	struct font big;
	struct font icons;

	struct image ch1;

	struct
	{
		GLuint shader;
		GLint pos;
		GLint coord;
		GLint aspect_w;
		GLint aspect_h;
		GLint crop;
	} crop_shader;
	struct
	{
		GLuint shader;
		GLint pos;
		GLint viewray;
		GLint crop;
		GLint scaler;
	} projection_shader;

	GLuint bgvbo;
	GLuint rayvbo;
	vec3 camera_rotation;
	mat4 camera_rotation_matrix;
	mat4 view_matrix;
	mat4 projection_matrix;
	float fov;
	float fovmin;
	float fovmax;
	bool projection;
	float interface_mult;
} gctx = {
	.fovmin = 10 * GLM_PIf / 180.0f,
	.fovmax = 140 * GLM_PIf / 180.0f,
	.fov = 100 * GLM_PIf / 180.0f,
	.ch1.fov_deg = 360,
	.projection = false,
	.interface_mult = 1};

void load_texture(char *file)
{
	gctx.ch1.data = stbi_load(file, &gctx.ch1.width, &gctx.ch1.height, &gctx.ch1.channels, 3);
	glDeleteTextures(1, &gctx.ch1.tex);
	glGenTextures(1, &gctx.ch1.tex);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, gctx.ch1.tex);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, gctx.ch1.width, gctx.ch1.height, 0, GL_RGB,
				 GL_UNSIGNED_BYTE, gctx.ch1.data);
	stbi_image_free(gctx.ch1.data);
	gctx.fov = glm_rad(100);
}

/* TODO: !!! BUFFER NOT FREED !!! */
EMSCRIPTEN_KEEPALIVE int load_file(uint8_t *buffer, size_t size)
{
	gctx.ch1.data = stbi_load_from_memory(buffer, size, &gctx.ch1.width,
										  &gctx.ch1.height,
										  &gctx.ch1.channels, 3);
	glDeleteTextures(1, &gctx.ch1.tex);
	glGenTextures(1, &gctx.ch1.tex);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, gctx.ch1.tex);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB, gctx.ch1.width, gctx.ch1.height, 0, GL_RGB,
				 GL_UNSIGNED_BYTE, gctx.ch1.data);
	stbi_image_free(gctx.ch1.data);
	glm_vec3_zero(gctx.camera_rotation);
	glm_vec3_zero(gctx.ch1.rotation);
	gctx.ch1.fov_deg = 360;
	gctx.fov = glm_rad(100);
	gctx.ch1.crop.bot = gctx.ch1.crop.top = gctx.ch1.crop.left = gctx.ch1.crop.right = 0;
	return 1;
}

#define WINDOW_WIDTH 1024
#define WINDOW_HEIGHT 1024

#define MAX_VERTEX_MEMORY 512 * 1024
#define MAX_ELEMENT_MEMORY 128 * 1024

#define UNUSED(a) (void)a
#define MIN(a, b) ((a) < (b) ? (a) : (b))
#define MAX(a, b) ((a) < (b) ? (b) : (a))
#define LEN(a) (sizeof(a) / sizeof(a)[0])

/* Platform */
SDL_Window *win;
int running = nk_true;

static void
MainLoop(void *loopArg)
{
	struct nk_context *ctx = (struct nk_context *)loopArg;
	/* Input */
	SDL_Event evt;
	nk_input_begin(ctx);
	while (SDL_PollEvent(&evt))
	{
		if (evt.type == SDL_QUIT)
			running = nk_false;
		nk_sdl_handle_event(&evt);
		/*
					switch (evt.type)
					{
					case SDL_MOUSEMOTION:


					case SDL_MOUSEWHEEL:
						gctx.fov -= (float)evt.wheel.y * 0.1;

							gctx.fov += evt.mgesture.dDist;
							gctx.fov -= (float)evt.wheel.y;
						  if(evt.type == SDL_MOUSEBUTTONDOWN)
						  gctx.camera_rotation[1] += evt.tfinger.dx * 0.001;
				} */
		switch (evt.type)
		{
			/* 		case SDL_KEYDOWN:
					{
						switch (evt.key.keysym.sym)
						{
						case SDLK_q:
							gctx.fov -= 0.01;
							break;
						case SDLK_e:
							gctx.fov += 0.01;
							break;
						case SDLK_UP:
							gctx.camera_rotation[0] += 0.01;
							if (gctx.camera_rotation[0] > M_PI / 2.0)
								gctx.camera_rotation[0] = M_PI / 2.0;
							if (gctx.camera_rotation[0] < M_PI / -2.0)
								gctx.camera_rotation[0] = M_PI / -2.0;
							break;
						case SDLK_DOWN:
							gctx.camera_rotation[0] -= 0.01;
							if (gctx.camera_rotation[0] > M_PI / 2.0)
								gctx.camera_rotation[0] = M_PI / 2.0;
							if (gctx.camera_rotation[0] < M_PI / -2.0)
								gctx.camera_rotation[0] = M_PI / -2.0;
							break;
						case SDLK_LEFT:	gctx.camera_rotation[1] -= 0.01; break;
						case SDLK_RIGHT: gctx.camera_rotation[1] += 0.01; break;
						}
					} */
		case SDL_FINGERMOTION:
			gctx.camera_rotation[1] += evt.tfinger.dx * 2.0;
			gctx.camera_rotation[0] += evt.tfinger.dy * 2.0;
			break;
		case SDL_MULTIGESTURE:
			gctx.fov -= evt.mgesture.dDist * 4;
			break;
		}
	}
	nk_input_end(ctx);

	if (ctx->input.keyboard.keys[NK_KEY_LEFT].down && !ctx->input.keyboard.keys[NK_KEY_SHIFT].down)
		gctx.camera_rotation[1] += 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_RIGHT].down && !ctx->input.keyboard.keys[NK_KEY_SHIFT].down)
		gctx.camera_rotation[1] -= 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_UP].down)
		gctx.camera_rotation[0] += 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_DOWN].down)
		gctx.camera_rotation[0] -= 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_LEFT].down && ctx->input.keyboard.keys[NK_KEY_SHIFT].down)
		gctx.fov += 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_RIGHT].down && ctx->input.keyboard.keys[NK_KEY_SHIFT].down)
		gctx.fov -= 0.05;

	if (gctx.camera_rotation[0] > M_PI / 2.0)
		gctx.camera_rotation[0] = M_PI / 2.0;
	if (gctx.camera_rotation[0] < M_PI / -2.0)
		gctx.camera_rotation[0] = M_PI / -2.0;

	if (!nk_window_is_any_hovered(ctx))
	{
		gctx.fov -= ctx->input.mouse.scroll_delta.y * 0.1;
	}

	/* Rotation input from mouse */

	if (gctx.fov > gctx.fovmax)
		gctx.fov = gctx.fovmax;
	if (gctx.fov < gctx.fovmin)
		gctx.fov = gctx.fovmin;

	int win_width, win_height;
	SDL_GetWindowSize(win, &win_width, &win_height);
	glViewport(0, 0, win_width, win_height);
	glClear(GL_COLOR_BUFFER_BIT);

	/* GUI */
	if (nk_begin(ctx, "Frost-O-Rama", nk_rect(20 * gctx.interface_mult, 20 * gctx.interface_mult, 400 * gctx.interface_mult, 600 * gctx.interface_mult),
				 NK_WINDOW_BORDER | NK_WINDOW_MOVABLE | NK_WINDOW_SCALABLE |
					 NK_WINDOW_MINIMIZABLE | NK_WINDOW_TITLE))
	{
		nk_layout_row_dynamic(ctx, 18 * gctx.interface_mult, 1);
		nk_label(ctx, "Switch between Setup and Projection here", NK_TEXT_ALIGN_LEFT);
		nk_style_set_font(ctx, gctx.std.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 2);
		if (nk_option_label(ctx, "Crop image", !gctx.projection))
			gctx.projection = false;
		if (nk_option_label(ctx, "Project image", gctx.projection))
			gctx.projection = true;
		nk_layout_row_dynamic(ctx, 18 * gctx.interface_mult, 1);
		nk_label(ctx, "Arrow keys on computer or Touch-Drag on", NK_TEXT_ALIGN_LEFT);
		nk_label(ctx, "Smartphones to move the projection camera.", NK_TEXT_ALIGN_LEFT);
		nk_label(ctx, "Shift + Arrows or pinch to zoom", NK_TEXT_ALIGN_LEFT);
		nk_label(ctx, "Click-Drag or Touch-Drag over settings", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 1);
		gctx.fov = glm_rad(nk_propertyf(ctx, "Virtual Camera Zoom [in °]", glm_deg(gctx.fovmin), glm_deg(gctx.fov), glm_deg(gctx.fovmax), 1, 0.5));
		nk_style_set_font(ctx, gctx.big.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 1);
		nk_label(ctx, "Input", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4 * gctx.interface_mult, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);
		nk_style_set_font(ctx, gctx.std.handle);
		if (nk_tree_push(ctx, NK_TREE_TAB, "Sample images", NK_MAXIMIZED))
		{
			ctx->style.button.text_normal = nk_rgb(175, 175, 175);
			ctx->style.button.text_hover = nk_rgb(175, 175, 175);
			ctx->style.button.text_active = nk_rgb(175, 175, 175);
			nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 1);
			if (nk_button_label(ctx, "Room"))
			{
				glm_vec3_zero(gctx.ch1.rotation);
				glm_vec3_zero(gctx.camera_rotation);
				load_texture("/res/room.jpg");
				gctx.camera_rotation[1] = 1.5;
				gctx.ch1.crop.top = 46;
				gctx.ch1.crop.bot = 62;
				gctx.ch1.crop.left = 45;
				gctx.ch1.crop.right = 63;
				gctx.ch1.fov_deg = 342;
			}
			if (nk_button_label(ctx, "Department Store"))
			{
				glm_vec3_zero(gctx.ch1.rotation);
				glm_vec3_zero(gctx.camera_rotation);
				load_texture("/res/store.jpg");
				gctx.camera_rotation[0] = -0.5;
				gctx.camera_rotation[1] = 1.5;
				gctx.ch1.crop.top = 97;
				gctx.ch1.crop.bot = 125;
				gctx.ch1.crop.left = 102;
				gctx.ch1.crop.right = 113;
				gctx.ch1.rotation[0] = glm_rad(-88.3);
				gctx.ch1.fov_deg = 310.29;
			}
			if (nk_button_label(ctx, "Human Mouth"))
			{
				glm_vec3_zero(gctx.ch1.rotation);
				glm_vec3_zero(gctx.camera_rotation);
				load_texture("/res/mouth.jpg");
				gctx.camera_rotation[1] = 3;
				gctx.ch1.crop.top = 567;
				gctx.ch1.crop.bot = 538;
				gctx.ch1.crop.left = 555;
				gctx.ch1.crop.right =596;
				gctx.ch1.fov_deg = 304;
				gctx.ch1.rotation[0] = glm_rad(25);
				gctx.ch1.rotation[2] = glm_rad(1);
				gctx.fov = glm_rad(125);
			}
			if (nk_button_label(ctx, "HUGE Tokyo Ball"))
			{
				glm_vec3_zero(gctx.ch1.rotation);
				glm_vec3_zero(gctx.camera_rotation);
				load_texture("/res/tokyo.jpg");
				gctx.camera_rotation[1] = 2;
				gctx.ch1.crop.top = 32;
				gctx.ch1.crop.bot = 39;
				gctx.ch1.crop.left = 63;
				gctx.ch1.crop.right = 17;
				gctx.ch1.fov_deg = 306;
			}
			nk_tree_pop(ctx);
		}
		if (nk_tree_push(ctx, NK_TREE_TAB, "Load Image from device", NK_MAXIMIZED))
		{
			nk_style_set_font(ctx, gctx.std.handle);
			nk_layout_row_dynamic(ctx, 18 * gctx.interface_mult, 1);
			nk_label(ctx, "Load Mirror ball as a photo, only JPEG or PNG!", NK_TEXT_ALIGN_LEFT);
			nk_label(ctx, "(iPhones default to shooting .HEIC, please", NK_TEXT_ALIGN_LEFT);
			nk_label(ctx, "convert or change to JPG in system settings)", NK_TEXT_ALIGN_LEFT);
			nk_style_set_font(ctx, gctx.icons.handle);
			nk_layout_row_dynamic(ctx, 64 * gctx.interface_mult, 1);
			ctx->style.button.text_normal = nk_rgb(8, 166, 142);
			ctx->style.button.text_hover = nk_rgb(8, 166, 142);
			ctx->style.button.text_active = nk_rgb(8, 166, 142);
			if (nk_button_label(ctx, ""))
			{
				/* NON BLOCKING! */
				EM_ASM(
					var file_selector = document.createElement('input');
					file_selector.setAttribute('type', 'file');
					file_selector.setAttribute('onchange', 'open_file(event)');
					file_selector.setAttribute('accept', '.png,.jpeg'); // optional - limit accepted file types
					file_selector.click(););
			}

			nk_tree_pop(ctx);
		}
		/* Cropping */
		nk_style_set_font(ctx, gctx.big.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 1);
		nk_label(ctx, "Cropping", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4 * gctx.interface_mult, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, gctx.std.handle);
		nk_layout_row_dynamic(ctx, 30 * gctx.interface_mult, 1);
		nk_label(ctx, "Crop the image to the mirror ball's edge", NK_TEXT_ALIGN_LEFT);
		nk_property_int(ctx, "Top [px]", 0, &gctx.ch1.crop.top, gctx.ch1.height / 2, 1, 1);
		nk_property_int(ctx, "Bottom [px]", 0, &gctx.ch1.crop.bot, gctx.ch1.height / 2, 1, 1);
		nk_property_int(ctx, "Left [px]", 0, &gctx.ch1.crop.left, gctx.ch1.width / 2, 1, 1);
		nk_property_int(ctx, "Right [px]", 0, &gctx.ch1.crop.right, gctx.ch1.width / 2, 1, 1);

		/* Distortion Correction */
		nk_style_set_font(ctx, gctx.big.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 1);
		nk_label(ctx, "Distortion Correction", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4 * gctx.interface_mult, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, gctx.std.handle);
		nk_layout_row_dynamic(ctx, 30 * gctx.interface_mult, 1);
		nk_label(ctx, "For correcting distortion at the pole-point", NK_TEXT_ALIGN_LEFT);

		nk_property_float(ctx, "Sphere's field of view [in °]", 180, &gctx.ch1.fov_deg, 360, 1, 0.1);
		gctx.ch1.fov = 1.0 / sin(glm_rad(gctx.ch1.fov_deg) / 4.0);

		/* World rotation */
		nk_style_set_font(ctx, gctx.big.handle);
		nk_layout_row_dynamic(ctx, 32 * gctx.interface_mult, 1);
		nk_label(ctx, "World Rotation", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 4 * gctx.interface_mult, 1);
		nk_rule_horizontal(ctx, nk_rgb(176, 176, 176), nk_true);

		nk_style_set_font(ctx, gctx.std.handle);
		nk_layout_row_dynamic(ctx, 20 * gctx.interface_mult, 1);
		nk_label(ctx, "If the mirror ball was captured not at horizon level,", NK_TEXT_ALIGN_LEFT);
		nk_label(ctx, "correct it here, or camera control will be strange.", NK_TEXT_ALIGN_LEFT);
		nk_layout_row_dynamic(ctx, 30 * gctx.interface_mult, 1);
		gctx.ch1.rotation[0] = glm_rad(nk_propertyf(ctx, "Pitch [offset in °]", -180, glm_deg(gctx.ch1.rotation[0]), 180, 1, 0.1));
		gctx.ch1.rotation[1] = glm_rad(nk_propertyf(ctx, "Yaw [offset in °]", -180, glm_deg(gctx.ch1.rotation[1]), 180, 1, 0.1));
		gctx.ch1.rotation[2] = glm_rad(nk_propertyf(ctx, "Roll [offset in °]", -180, glm_deg(gctx.ch1.rotation[2]), 180, 1, 0.1));

		nk_style_set_font(ctx, gctx.std.handle);
	}
	nk_end(ctx);

	/* Update Camera */
	mat4 basis;
	mat4 eulerangles;
	glm_mat4_identity(basis);
	glm_euler_zyx(gctx.camera_rotation, gctx.camera_rotation_matrix);
	glm_euler_zyx(gctx.ch1.rotation, eulerangles);
	glm_mat4_mul(basis, eulerangles, basis);
	glm_mat4_mul(basis, gctx.camera_rotation_matrix, basis);
	glm_mat4_copy(basis, gctx.camera_rotation_matrix);
	glm_mat4_identity(gctx.view_matrix);
	glm_translate(gctx.view_matrix, (vec3){0.0, 0.0, 0.0});
	glm_mul_rot(gctx.view_matrix, gctx.camera_rotation_matrix, gctx.view_matrix);
	glm_inv_tr(gctx.view_matrix);
	glm_perspective(gctx.fov, (float)win_width / (float)win_height, 0.01f, 100.0f, gctx.projection_matrix);

	/* Update View-Rays */
	double distance = -0.5 / tan(gctx.fov / 2.0);
	for (int i = 0; i < 4 * 5; i += 5)
	{
		viewrays[i + 4] = distance;
		viewrays[i + 2] = viewrays[i] * 0.5 * (float)win_width / (float)win_height;
		viewrays[i + 3] = viewrays[i + 1] * 0.5;
		glm_vec3_rotate_m4(gctx.camera_rotation_matrix, &viewrays[i + 2], &viewrays[i + 2]);
	}

	/* Drawcalls */
	if (!gctx.projection)
	{
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, gctx.ch1.tex);
		glUseProgram(gctx.crop_shader.shader);
		vec4 crop;
		int postcrop_w = gctx.ch1.width - (gctx.ch1.crop.left + gctx.ch1.crop.right);
		int postcrop_h = gctx.ch1.height - (gctx.ch1.crop.top + gctx.ch1.crop.bot);
		crop[0] = (1.0 / gctx.ch1.width) * gctx.ch1.crop.left;
		crop[1] = (1.0 / gctx.ch1.height) * gctx.ch1.crop.top;
		crop[2] = (1.0 / gctx.ch1.width) * postcrop_w;
		crop[3] = (1.0 / gctx.ch1.height) * postcrop_h;
		glUniform4fv(gctx.crop_shader.crop, 1, &crop[0]);

		glBindBuffer(GL_ARRAY_BUFFER, gctx.bgvbo);
		glVertexAttribPointer(gctx.crop_shader.pos, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), 0);
		glVertexAttribPointer(gctx.crop_shader.coord, 2, GL_FLOAT, GL_FALSE,
							  4 * sizeof(float), (void *)(2 * sizeof(float)));

		if (((float)postcrop_h / (float)postcrop_w) >
			((float)win_height / (float)win_width))
		{
			glUniform1f(gctx.crop_shader.aspect_h, 1.0);
			glUniform1f(gctx.crop_shader.aspect_w,
						((float)postcrop_w / (float)postcrop_h) /
							((float)win_width / (float)win_height));
		}
		else
		{
			glUniform1f(gctx.crop_shader.aspect_h,
						((float)postcrop_h / (float)postcrop_w) /
							((float)win_height / (float)win_width));
			glUniform1f(gctx.crop_shader.aspect_w, 1.0);
		}
		glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
		glUseProgram(0);
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, 0);
	}
	else
	{
		vec4 crop;
		crop[0] = (1.0 / gctx.ch1.width) * (gctx.ch1.width / 2.0 + gctx.ch1.crop.left / 2.0 - gctx.ch1.crop.right / 2.0);
		crop[1] = (1.0 / gctx.ch1.height) * (gctx.ch1.height / 2.0 + gctx.ch1.crop.top / 2.0 - gctx.ch1.crop.bot / 2.0);
		crop[2] = (1.0 / gctx.ch1.width) * (gctx.ch1.width - gctx.ch1.crop.left / 1.0 - gctx.ch1.crop.right / 1.0);
		crop[3] = (1.0 / gctx.ch1.height) * (gctx.ch1.height - gctx.ch1.crop.top / 1.0 - gctx.ch1.crop.bot / 1.0);
		glUseProgram(gctx.projection_shader.shader);
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, gctx.ch1.tex);
		glEnableVertexAttribArray(gctx.projection_shader.pos);
		glEnableVertexAttribArray(gctx.projection_shader.viewray);
		glUniform4fv(gctx.projection_shader.crop, 1, crop);
		glBindBuffer(GL_ARRAY_BUFFER, gctx.rayvbo);
		glBufferData(GL_ARRAY_BUFFER, sizeof(viewrays), viewrays, GL_DYNAMIC_DRAW);
		glVertexAttribPointer(gctx.projection_shader.pos, 2, GL_FLOAT, GL_FALSE,
							  5 * sizeof(float), 0);
		glVertexAttribPointer(gctx.projection_shader.viewray, 3, GL_FLOAT, GL_FALSE,
							  5 * sizeof(float), (void *)(2 * sizeof(float)));
		glUniform1f(gctx.projection_shader.scaler, gctx.ch1.fov);
		glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
		glDisableVertexAttribArray(gctx.projection_shader.pos);
		glDisableVertexAttribArray(gctx.projection_shader.viewray);
		glBindBuffer(GL_ARRAY_BUFFER, 0);
		glUseProgram(0);
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, 0);
	}

	nk_sdl_render(NK_ANTI_ALIASING_ON, MAX_VERTEX_MEMORY, MAX_ELEMENT_MEMORY);
	SDL_GL_SwapWindow(win);
}

int main(int argc, char *argv[])
{
	/* GUI */
	struct nk_context *ctx;
	SDL_GLContext glContext;

	NK_UNUSED(argc);
	NK_UNUSED(argv);

	/* SDL setup */
	SDL_SetHint(SDL_HINT_VIDEO_HIGHDPI_DISABLED, "1");
	SDL_GL_SetAttribute(SDL_GL_DOUBLEBUFFER, 1);
	win = SDL_CreateWindow("Frost-O-Rama",
						   SDL_WINDOWPOS_CENTERED, SDL_WINDOWPOS_CENTERED,
						   WINDOW_WIDTH, WINDOW_HEIGHT,
						   SDL_WINDOW_OPENGL |
							   SDL_WINDOW_SHOWN |
							   SDL_WINDOW_RESIZABLE); /* |
							  SDL_WINDOW_ALLOW_HIGHDPI */
	glContext = SDL_GL_CreateContext(win);

	/* OpenGL setup */
	glViewport(0, 0, WINDOW_WIDTH, WINDOW_HEIGHT);
	glClearColor(0, 0, 0, 1);
	/* Prevents headaches when loading NPOT textures */
	glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
	glPixelStorei(GL_PACK_ALIGNMENT, 1);

	ctx = nk_sdl_init(win);

	load_texture("/res/room.jpg");
	gctx.camera_rotation[1] = 1.5;
	gctx.ch1.crop.top = 46;
	gctx.ch1.crop.bot = 62;
	gctx.ch1.crop.left = 45;
	gctx.ch1.crop.right = 63;
	gctx.ch1.fov_deg = 342;

	/* Setup Shaders */
	gctx.crop_shader.shader = compile_shader(&crop_vs, &crop_fs);
	gctx.projection_shader.shader = compile_shader(&proj_vs, &proj_fs);

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

	ctx->style.scrollv.rounding_cursor = 12 * gctx.interface_mult;
	ctx->style.scrollv.rounding = 12 * gctx.interface_mult;
	ctx->style.property.rounding = 12 * gctx.interface_mult;
	ctx->style.window.scrollbar_size = nk_vec2(24 * gctx.interface_mult, 24 * gctx.interface_mult);
	/* Really needs to be scoped the hell out of this file */
	{
		/* Fonts */
		struct nk_font *std, *big, *icons;
		struct nk_font_atlas *atlas;
		struct nk_font_config cfg_std = nk_font_config(0);
		struct nk_font_config cfg_big = nk_font_config(0);
		struct nk_font_config cfg_icons = nk_font_config(0);
		const nk_rune ranges_std[] = {
			0x0020, 0x007E, /* Ascii */
			0x00A1, 0x00FF, /* Symbols + Umlaute */
			0};
		const nk_rune ranges_icons[] = {
			0xF00D, 0xF00D, /*  */
			0xF07C, 0xF07C, /*  */
			0xF083, 0xF083, /*  */
			0xF0AD, 0xF0AD, /*  */
			0xF021, 0xF021, /*  */
			0xF1C5, 0xF1C5, /*  */
			0xF063, 0xF063, /*  */
			0xF053, 0xF053, /*  */
			0xF054, 0xF054, /*  */
			0};

		gctx.std.ranges = malloc(sizeof(ranges_std));
		gctx.big.ranges = malloc(sizeof(ranges_std));
		gctx.icons.ranges = malloc(sizeof(ranges_icons));
		memcpy(gctx.std.ranges, ranges_std, sizeof(ranges_std));
		memcpy(gctx.big.ranges, ranges_std, sizeof(ranges_std));
		memcpy(gctx.icons.ranges, ranges_icons, sizeof(ranges_icons));

		cfg_std.range = gctx.std.ranges;
		cfg_big.range = gctx.big.ranges;
		cfg_icons.range = gctx.icons.ranges;
		cfg_std.oversample_h = cfg_std.oversample_v = 1;
		cfg_big.oversample_h = cfg_icons.oversample_v = 1;
		cfg_icons.oversample_h = cfg_icons.oversample_v = 1;
		cfg_std.pixel_snap = true;
		cfg_big.pixel_snap = true;
		cfg_icons.pixel_snap = true;

		nk_sdl_font_stash_begin(&atlas);
		std = nk_font_atlas_add_from_file(
			atlas, "/res/roboto.ttf", 22 * gctx.interface_mult, &cfg_std);
		big = nk_font_atlas_add_from_file(
			atlas, "/res/roboto.ttf", 32 * gctx.interface_mult, &cfg_big);
		icons = nk_font_atlas_add_from_file(
			atlas, "/res/icons.ttf", 46 * gctx.interface_mult, &cfg_icons);
		nk_sdl_font_stash_end();

		gctx.std.handle = &std->handle;
		gctx.big.handle = &big->handle;
		gctx.icons.handle = &icons->handle;
		nk_style_set_font(ctx, gctx.std.handle);
	}

	emscripten_set_main_loop_arg(MainLoop, (void *)ctx, 0, nk_true);

	nk_sdl_shutdown();
	SDL_GL_DeleteContext(glContext);
	SDL_DestroyWindow(win);
	SDL_Quit();
	return 0;
}

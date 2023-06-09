#include "gui.h"
#include "input.h"
#include "main.h"

void draw_project();
void draw_border(bool project_points, int subdiv);
void draw_crop();

void render_loop(void *loopArg)
{
	/* Handle user inputs */
	input();

	int win_width, win_height;
	SDL_GL_GetDrawableSize(gctx.win, &win_width, &win_height);
	glViewport(0, 0, win_width, win_height);
	glClear(GL_COLOR_BUFFER_BIT);

	/* Define GUI */
	gui();

	/* Update Camera */
	mat4 basis;
	mat4 eulerangles;
	glm_mat4_identity(basis);
	glm_euler_zyx(gctx.cam.cam_rotation, gctx.cam.cam_rotation_matrix);
	glm_euler_zyx(gctx.ch1.rotation, eulerangles);
	glm_mat4_mul(basis, eulerangles, basis);
	glm_mat4_mul(basis, gctx.cam.cam_rotation_matrix, basis);
	glm_mat4_copy(basis, gctx.cam.cam_rotation_matrix);
	glm_mat4_identity(gctx.cam.view_matrix);
	glm_translate(gctx.cam.view_matrix, (vec3){0.0, 0.0, 0.0});
	glm_mul_rot(gctx.cam.view_matrix, gctx.cam.cam_rotation_matrix, gctx.cam.view_matrix);
	glm_inv_tr(gctx.cam.view_matrix);
	glm_perspective(gctx.cam.fov, (float)win_width / (float)win_height, 0.01f, 100.0f, gctx.cam.projection_matrix);

	/* Update View-Rays */
	double distance = -0.5 / tan(gctx.cam.fov / 2.0);
	for (int i = 0; i < 4 * 5; i += 5)
	{
		gctx.ch1.viewrays[i + 4] = distance;
		gctx.ch1.viewrays[i + 2] = gctx.ch1.viewrays[i] * 0.5 * (float)win_width / (float)win_height;
		gctx.ch1.viewrays[i + 3] = gctx.ch1.viewrays[i + 1] * 0.5;
		glm_vec3_rotate_m4(gctx.cam.cam_rotation_matrix, &gctx.ch1.viewrays[i + 2], &gctx.ch1.viewrays[i + 2]);
	}

	/* Drawcalls */
	if (!gctx.projection)
	{
		/* Draw 2D and crop view */
		draw_crop();

		if (gctx.vizualize)
		{
			/* Draw the screen border distortion vizulization */
			draw_border(true, 16);
		}
	}
	else
	{
		/* Draw the projection shader */
		draw_project();
		
		if (gctx.vizualize)
		{
			/* Draw the screen border distortion vizulization */
			draw_border(false, 16);
		}
	}

	/* Max Buffer sizes for the GUI */
	const int MAX_VERTEX_MEMORY = 512 * 1024;
	const int MAX_ELEMENT_MEMORY = 128 * 1024;

	/* Draw GUI */
	nk_sdl_render(NK_ANTI_ALIASING_ON, MAX_VERTEX_MEMORY, MAX_ELEMENT_MEMORY);
	/* V-Sync */
	SDL_GL_SwapWindow(gctx.win);
}
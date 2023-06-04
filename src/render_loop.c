#include "gui.h"
#include "input.h"
#include "main.h"

static float viewrays[] = {
	-1.0, 1.0, 0.0, 0.0, 0.0,
	1.0, 1.0, 0.0, 0.0, 0.0,
	1.0, -1.0, 0.0, 0.0, 0.0,
	-1.0, -1.0, 0.0, 0.0, 0.0};

/* TODO: !!! BUFFER NOT FREED !!! */
EMSCRIPTEN_KEEPALIVE int load_file(uint8_t *buffer, size_t size)
{
	/* 	gctx.ch1.data = stbi_load_from_memory(buffer, size, &gctx.ch1.width,
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
		glm_vec3_zero(gctx.cam.cam_rotation);
		glm_vec3_zero(gctx.ch1.rotation);
		gctx.ch1.fov_deg = 360;
		gctx.fov = glm_rad(100);
		gctx.ch1.crop.bot = gctx.ch1.crop.top = gctx.ch1.crop.left = gctx.ch1.crop.right = 0; */
	puts("Please make it till here");
	return 1;
}

/* Interpolates and projects the border points for a nice little vizualization
   to explain the projection mapping */
void interpolate_border_points(GLint uniform_pos, vec3 a, vec3 b, int subdiv,
							   GLint uniform_col, vec3 color_a, vec3 color_b,
							   float view_scaler)
{
	const float m_2SQRT2 = 2.8284271247461900976033774484194;
	if (subdiv % 2 == 1)
	{
		subdiv++;
	}
	vec3 ray;
	vec2 uv_proj;
	vec3 color;
	for (int x = 0; x < subdiv; ++x)
	{
		float mult = (1.0 / subdiv) * x;
		glm_vec3_lerp(a, b, mult, ray);
		glm_vec3_lerp(color_a, color_b, mult, color);
		glm_vec3_normalize(ray);
		float divider = m_2SQRT2 * sqrt(ray[2] + 1.0);
		uv_proj[0] = ray[0] * view_scaler / divider;
		uv_proj[1] = ray[1] * view_scaler / divider;
		glm_vec2_scale(uv_proj, 2, uv_proj);
		glUniform2fv(uniform_pos, 1, uv_proj);
		glUniform2f(uniform_pos, uv_proj[0], uv_proj[1]);
		glUniform3fv(uniform_col, 1, color);
		glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	}
}

void MainLoop(void *loopArg)
{
	struct global_context *gctx = (struct global_context *)loopArg;

	input(gctx);

	int win_width, win_height;
	SDL_GetWindowSize(gctx->win, &win_width, &win_height);
	float aspect = (float)win_width / (float)win_height;
	glViewport(0, 0, win_width, win_height);
	glClear(GL_COLOR_BUFFER_BIT);

	gui(gctx);

	/* Update Camera */
	mat4 basis;
	mat4 eulerangles;
	glm_mat4_identity(basis);
	glm_euler_zyx(gctx->cam.cam_rotation, gctx->cam.cam_rotation_matrix);
	glm_euler_zyx(gctx->ch1.rotation, eulerangles);
	glm_mat4_mul(basis, eulerangles, basis);
	glm_mat4_mul(basis, gctx->cam.cam_rotation_matrix, basis);
	glm_mat4_copy(basis, gctx->cam.cam_rotation_matrix);
	glm_mat4_identity(gctx->cam.view_matrix);
	glm_translate(gctx->cam.view_matrix, (vec3){0.0, 0.0, 0.0});
	glm_mul_rot(gctx->cam.view_matrix, gctx->cam.cam_rotation_matrix, gctx->cam.view_matrix);
	glm_inv_tr(gctx->cam.view_matrix);
	glm_perspective(gctx->cam.fov, (float)win_width / (float)win_height, 0.01f, 100.0f, gctx->cam.projection_matrix);

	/* Update View-Rays */
	double distance = -0.5 / tan(gctx->cam.fov / 2.0);
	for (int i = 0; i < 4 * 5; i += 5)
	{
		viewrays[i + 4] = distance;
		viewrays[i + 2] = viewrays[i] * 0.5 * (float)win_width / (float)win_height;
		viewrays[i + 3] = viewrays[i + 1] * 0.5;
		glm_vec3_rotate_m4(gctx->cam.cam_rotation_matrix, &viewrays[i + 2], &viewrays[i + 2]);
	}

	/* Drawcalls */
	if (!gctx->projection)
	{
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, gctx->ch1.img.tex);
		glUseProgram(gctx->crop_shader.shader);
		vec4 crop;
		int postcrop_w = gctx->ch1.img.w - (gctx->ch1.crop.left + gctx->ch1.crop.right);
		int postcrop_h = gctx->ch1.img.h - (gctx->ch1.crop.top + gctx->ch1.crop.bot);
		crop[0] = (1.0 / gctx->ch1.img.w) * gctx->ch1.crop.left;
		crop[1] = (1.0 / gctx->ch1.img.h) * gctx->ch1.crop.top;
		crop[2] = (1.0 / gctx->ch1.img.w) * postcrop_w;
		crop[3] = (1.0 / gctx->ch1.img.h) * postcrop_h;

		glUniform4fv(gctx->crop_shader.crop, 1, &crop[0]);

		glBindBuffer(GL_ARRAY_BUFFER, gctx->bgvbo);
		glVertexAttribPointer(gctx->crop_shader.vtx, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), 0);
		glVertexAttribPointer(gctx->crop_shader.coord, 2, GL_FLOAT, GL_FALSE,
							  4 * sizeof(float), (void *)(2 * sizeof(float)));

		if (((float)postcrop_h / (float)postcrop_w) >
			((float)win_height / (float)win_width))
		{
			glUniform1f(gctx->crop_shader.aspect_h, 1.0);
			glUniform1f(gctx->crop_shader.aspect_w,
						((float)postcrop_w / (float)postcrop_h) /
							((float)win_width / (float)win_height));
		}
		else
		{
			glUniform1f(gctx->crop_shader.aspect_h,
						((float)postcrop_h / (float)postcrop_w) /
							((float)win_height / (float)win_width));
			glUniform1f(gctx->crop_shader.aspect_w, 1.0);
		}

		glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
		glUseProgram(0);
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, 0);

		glUseProgram(gctx->border_shader.shader);
		glBindBuffer(GL_ARRAY_BUFFER, gctx->border_shader.quadvbo);

		if (((float)postcrop_h / (float)postcrop_w) >
			((float)win_height / (float)win_width))
		{
			glUniform1f(gctx->border_shader.aspect_h, 1.0);
			glUniform1f(gctx->border_shader.aspect_w,
						((float)postcrop_w / (float)postcrop_h) /
							((float)win_width / (float)win_height));
		}
		else
		{
			glUniform1f(gctx->border_shader.aspect_h,
						((float)postcrop_h / (float)postcrop_w) /
							((float)win_height / (float)win_width));
			glUniform1f(gctx->border_shader.aspect_w, 1.0);
		}

		glUniform1f(gctx->border_shader.scale, 0.01);
		glVertexAttribPointer(gctx->border_shader.vtx, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), 0);
		glUniform4fv(gctx->border_shader.crop, 1, &crop[0]);

		vec3 ray_topleft;
		glm_vec3_copy(&viewrays[2], ray_topleft);
		vec3 ray_topright;
		glm_vec3_copy(&viewrays[2 + 5], ray_topright);
		vec3 ray_botright;
		glm_vec3_copy(&viewrays[2 + 10], ray_botright);
		vec3 ray_botleft;
		glm_vec3_copy(&viewrays[2 + 15], ray_botleft);

		vec3 color_topleft = {1.0f, 0.0f, 1.0f};
		vec3 color_topright = {1.0f, 1.0f, 0.0f};
		vec3 color_botleft = {0.0f, 1.0f, 1.0f};
		vec3 color_botright = {1.0f, 1.0f, 0.0f};

		/* Should use instanced rendering */
		const int subdiv = 16;
		interpolate_border_points(gctx->border_shader.transform,
								  ray_topleft, ray_topright, subdiv * aspect,
								  gctx->border_shader.color,
								  color_topleft, color_topright, gctx->ch1.fov);
		interpolate_border_points(gctx->border_shader.transform,
								  ray_topright, ray_botright, subdiv,
								  gctx->border_shader.color,
								  color_topright, color_botright, gctx->ch1.fov);
		interpolate_border_points(gctx->border_shader.transform,
								  ray_botright, ray_botleft, subdiv * aspect,
								  gctx->border_shader.color,
								  color_botright, color_botleft, gctx->ch1.fov);
		interpolate_border_points(gctx->border_shader.transform,
								  ray_botleft, ray_topleft, subdiv,
								  gctx->border_shader.color,
								  color_botleft, color_topleft, gctx->ch1.fov);
		interpolate_border_points(gctx->border_shader.transform,
								  ray_botleft, ray_topright, subdiv * aspect * GLM_SQRT2,
								  gctx->border_shader.color,
								  color_botleft, color_topright, gctx->ch1.fov);
		interpolate_border_points(gctx->border_shader.transform,
								  ray_topleft, ray_botright, subdiv * aspect * GLM_SQRT2,
								  gctx->border_shader.color,
								  color_topleft, color_botright, gctx->ch1.fov);
	}
	else
	{
		vec4 crop;
		crop[0] = (1.0 / gctx->ch1.img.w) * (gctx->ch1.img.w / 2.0 + gctx->ch1.crop.left / 2.0 - gctx->ch1.crop.right / 2.0);
		crop[1] = (1.0 / gctx->ch1.img.h) * (gctx->ch1.img.h / 2.0 + gctx->ch1.crop.top / 2.0 - gctx->ch1.crop.bot / 2.0);
		crop[2] = (1.0 / gctx->ch1.img.w) * (gctx->ch1.img.w - gctx->ch1.crop.left / 1.0 - gctx->ch1.crop.right / 1.0);
		crop[3] = (1.0 / gctx->ch1.img.h) * (gctx->ch1.img.h - gctx->ch1.crop.top / 1.0 - gctx->ch1.crop.bot / 1.0);
		glUseProgram(gctx->projection_shader.shader);
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, gctx->ch1.img.tex);
		glEnableVertexAttribArray(gctx->projection_shader.pos);
		glEnableVertexAttribArray(gctx->projection_shader.viewray);
		glUniform4fv(gctx->projection_shader.crop, 1, crop);
		glBindBuffer(GL_ARRAY_BUFFER, gctx->rayvbo);
		glBufferData(GL_ARRAY_BUFFER, sizeof(viewrays), viewrays, GL_DYNAMIC_DRAW);
		glVertexAttribPointer(gctx->projection_shader.pos, 2, GL_FLOAT, GL_FALSE,
							  5 * sizeof(float), 0);
		glVertexAttribPointer(gctx->projection_shader.viewray, 3, GL_FLOAT, GL_FALSE,
							  5 * sizeof(float), (void *)(2 * sizeof(float)));
		glUniform1f(gctx->projection_shader.scaler, gctx->ch1.fov);
		glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
		glDisableVertexAttribArray(gctx->projection_shader.pos);
		glDisableVertexAttribArray(gctx->projection_shader.viewray);
		glBindBuffer(GL_ARRAY_BUFFER, 0);
		glUseProgram(0);
		glActiveTexture(GL_TEXTURE0);
		glBindTexture(GL_TEXTURE_2D, 0);
	}

	const int MAX_VERTEX_MEMORY = 512 * 1024;
	const int MAX_ELEMENT_MEMORY = 128 * 1024;

	nk_sdl_render(NK_ANTI_ALIASING_ON, MAX_VERTEX_MEMORY, MAX_ELEMENT_MEMORY);
	SDL_GL_SwapWindow(gctx->win);
}
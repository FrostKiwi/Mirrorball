#include "main.h"

#define COLOR_TOPLEFT \
	(vec3) { 1.0f, 0.0f, 1.0f }
#define COLOR_TOPRIGHT \
	(vec3) { 1.0f, 1.0f, 0.0f }
#define COLOR_BOTLEFT \
	(vec3) { 0.0f, 1.0f, 1.0f }
#define COLOR_BOTRIGHT \
	(vec3) { 1.0f, 1.0f, 0.0f }
/* Point size in percent compared height of the screen */
#define POINT_SIZE 0.02

/* Interpolates and projects the border points for a nice little vizualization
   to explain the projection mapping */
void interp_border_pts(vec3 a, vec3 b, int subdiv,
					   vec3 color_a, vec3 color_b)
{
	if (subdiv % 2 == 1)
		subdiv++;
	vec3 ray;
	vec2 uv_proj;
	vec3 color;
	for (int x = 0; x < subdiv; ++x)
	{
		float mult = (1.0 / subdiv) * x;
		glm_vec3_lerp(a, b, mult, ray);
		glm_vec3_lerp(color_a, color_b, mult, color);
		glm_vec3_normalize(ray);
		float divider = 2.f * GLM_SQRT2f * sqrtf(ray[2] + 1.0);
		glm_vec2_scale(ray, gctx.ch1.fov, uv_proj);
		glm_vec2_divs(uv_proj, divider, uv_proj);
		glm_vec2_scale(uv_proj, 2, uv_proj);
		glUniform2fv(gctx.border_shader.transform, 1, uv_proj);
		glUniform3fv(gctx.border_shader.color, 1, color);
		/* Draw small quad */
		glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	}
}

/* Interpolates and projects the border points for a nice little vizualization
   to explain the projection mapping */
void interp_border_pts_simple(vec2 a, vec2 b, int subdiv,
							  vec3 color_a, vec3 color_b, float aspect)
{
	if (subdiv % 2 == 1)
		subdiv++;
	vec2 out;
	vec3 color;
	for (int x = 0; x < subdiv; ++x)
	{
		float mult = (1.0 / subdiv) * x;
		glm_vec2_lerp(a, b, mult, out);
		/* I scale here the position by the size of the points to get them to
		   touch the inner border, instead of being cut in half by the screen
		   edges. Technically, this breaks the projection of the points ever so
		   slightly. Maybe I should add this logic in the upper calculation. */
		if (aspect > 1)
		{
			out[0] *= 1.0 - (POINT_SIZE / aspect);
			out[1] *= 1.0 - POINT_SIZE;
			out[0] *= aspect;
		}
		else
		{
			out[0] *= 1.0 - POINT_SIZE;
			out[1] *= 1.0 - POINT_SIZE * aspect;
			out[1] /= aspect;
		}
		glm_vec3_lerp(color_a, color_b, mult, color);
		glUniform2fv(gctx.border_shader.transform, 1, out);
		glUniform3fv(gctx.border_shader.color, 1, color);
		/* Draw small quad */
		glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	}
}

void draw_border(bool project_points, int subdiv)
{
	int win_width, win_height;
	SDL_GL_GetDrawableSize(gctx.win, &win_width, &win_height);
	float aspect = (float)win_width / (float)win_height;

	glUseProgram(gctx.border_shader.shader);
	glBindBuffer(GL_ARRAY_BUFFER, gctx.border_shader.quadvbo);
	glEnableVertexAttribArray(gctx.border_shader.vtx);

	int postcrop_w =
		gctx.ch1.img.w - (gctx.ch1.crop.left + gctx.ch1.crop.right);
	int postcrop_h =
		gctx.ch1.img.h - (gctx.ch1.crop.top + gctx.ch1.crop.bot);

	if (((float)postcrop_h / (float)postcrop_w) >
		((float)win_height / (float)win_width))
	{
		glUniform1f(gctx.border_shader.aspect_h, 1.0);
		glUniform1f(gctx.border_shader.aspect_w,
					((float)postcrop_w / (float)postcrop_h) /
						((float)win_width / (float)win_height));
	}
	else
	{
		glUniform1f(gctx.border_shader.aspect_h,
					((float)postcrop_h / (float)postcrop_w) /
						((float)win_height / (float)win_width));
		glUniform1f(gctx.border_shader.aspect_w, 1.0);
	}

	glVertexAttribPointer(gctx.border_shader.vtx, 2, GL_FLOAT, GL_FALSE,
						  2 * sizeof(float), 0);

	if (project_points)
	{
		glUniform1f(gctx.border_shader.scale, POINT_SIZE * 0.8);
		vec3 ray_topleft;
		glm_vec3_copy(&gctx.ch1.viewrays[2], ray_topleft);
		vec3 ray_topright;
		glm_vec3_copy(&gctx.ch1.viewrays[2 + 5], ray_topright);
		vec3 ray_botright;
		glm_vec3_copy(&gctx.ch1.viewrays[2 + 10], ray_botright);
		vec3 ray_botleft;
		glm_vec3_copy(&gctx.ch1.viewrays[2 + 15], ray_botleft);

		/* Should use instanced rendering */
		/* Top */
		interp_border_pts(ray_topleft, ray_topright, subdiv * aspect,
						  COLOR_TOPLEFT, COLOR_TOPRIGHT);
		/* Right */
		interp_border_pts(ray_topright, ray_botright, subdiv,
						  COLOR_TOPRIGHT, COLOR_BOTRIGHT);
		/* Bottom */
		interp_border_pts(ray_botright, ray_botleft, subdiv * aspect,
						  COLOR_BOTRIGHT, COLOR_BOTLEFT);
		/* Left */
		interp_border_pts(ray_botleft, ray_topleft, subdiv,
						  COLOR_BOTLEFT, COLOR_TOPLEFT);
		/* Diagonal, Bottom-left -> Top-right */
		interp_border_pts(ray_botleft, ray_topright,
						  subdiv * aspect * GLM_SQRT2,
						  COLOR_BOTLEFT, COLOR_TOPRIGHT);
		/* Diagonal, Top-left -> Bottom-right */
		interp_border_pts(ray_topleft, ray_botright,
						  subdiv * aspect * GLM_SQRT2,
						  COLOR_TOPLEFT, COLOR_BOTRIGHT);
	}
	else
	{
		glUniform1f(gctx.border_shader.scale, POINT_SIZE);
		vec2 topleft = {-1, 1};
		vec2 topright = {1, 1};
		vec2 botright = {1, -1};
		vec2 botleft = {-1, -1};

		/* Top */
		interp_border_pts_simple(topleft, topright, subdiv * aspect,
								 COLOR_TOPLEFT, COLOR_TOPRIGHT, aspect);
		/* Right */
		interp_border_pts_simple(topright, botright, subdiv,
								 COLOR_TOPRIGHT, COLOR_BOTRIGHT, aspect);
		/* Bottom */
		interp_border_pts_simple(botright, botleft, subdiv * aspect,
								 COLOR_BOTRIGHT, COLOR_BOTLEFT, aspect);
		/* Left */
		interp_border_pts_simple(botleft, topleft, subdiv,
								 COLOR_BOTLEFT, COLOR_TOPLEFT, aspect);
		/* Diagonal, Bottom-left -> Top-right */
		interp_border_pts_simple(botleft, topright, subdiv * aspect * GLM_SQRT2,
								 COLOR_BOTLEFT, COLOR_TOPRIGHT, aspect);
		/* Diagonal, Top-left -> Bottom-right */
		interp_border_pts_simple(topleft, botright, subdiv * aspect * GLM_SQRT2,
								 COLOR_TOPLEFT, COLOR_BOTRIGHT, aspect);
	}

	glDisableVertexAttribArray(gctx.border_shader.vtx);
}
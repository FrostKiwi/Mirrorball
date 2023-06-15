#include "main.h"

#define COLOR_TOPLEFT \
	(vec3s) { 1.0f, 0.0f, 1.0f }
#define COLOR_TOPRIGHT \
	(vec3s) { 1.0f, 1.0f, 0.0f }
#define COLOR_BOTLEFT \
	(vec3s) { 0.0f, 1.0f, 1.0f }
#define COLOR_BOTRIGHT \
	(vec3s) { 1.0f, 1.0f, 0.0f }
/* Point size in percent compared height of the screen */
#define POINT_SIZE 0.02

/* Interpolates and projects the border points for a nice little vizualization
   to explain the projection mapping */
void interp_border_pts(vec3s a, vec3s b, int subdiv,
					   vec3s color_a, vec3s color_b)
{
	if (subdiv % 2 == 1)
		subdiv++;
	vec3s ray;
	vec2s uv_proj;
	vec3s color;
	for (int x = 0; x < subdiv; ++x)
	{
		float mult = (1.0 / subdiv) * x;
		ray = glms_vec3_lerp(a, b, mult);
		color = glms_vec3_lerp(color_a, color_b, mult);
		ray = glms_vec3_normalize(ray);
		float divider = 2.f * GLM_SQRT2f * sqrtf(ray.z + 1.0);
		uv_proj = glms_vec2_scale((vec2s){ray.x, ray.y}, gctx.ch1.fov);
		uv_proj = glms_vec2_divs(uv_proj, divider);
		uv_proj = glms_vec2_scale(uv_proj, 2);
		glUniform2fv(gctx.border_shader.transform, 1, uv_proj.raw);
		glUniform3fv(gctx.border_shader.color, 1, color.raw);
		/* Draw small quad */
		glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	}
}

/* Interpolates and projects the border points for a nice little vizualization
   to explain the projection mapping */
void interp_border_pts_simple(vec2s a, vec2s b, int subdiv,
							  vec3s color_a, vec3s color_b, float aspect)
{
	if (subdiv % 2 == 1)
		subdiv++;
	vec2s out;
	vec3s color;
	for (int x = 0; x < subdiv; ++x)
	{
		float mult = (1.0 / subdiv) * x;
		out = glms_vec2_lerp(a, b, mult);
		/* I scale here the position by the size of the points to get them to
		   touch the inner border, instead of being cut in half by the screen
		   edges. Technically, this breaks the projection of the points ever so
		   slightly. Maybe I should add this logic in the upper calculation. */
		if (aspect > 1)
		{
			out.x *= 1.0 - (POINT_SIZE / aspect);
			out.y *= 1.0 - POINT_SIZE;
			out.x *= aspect;
		}
		else
		{
			out.x *= 1.0 - POINT_SIZE;
			out.y *= 1.0 - POINT_SIZE * aspect;
			out.y /= aspect;
		}
		color = glms_vec3_lerp(color_a, color_b, mult);
		glUniform2fv(gctx.border_shader.transform, 1, out.raw);
		glUniform3fv(gctx.border_shader.color, 1, color.raw);
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
		vec3s ray_topleft;
		glm_vec3_copy(&gctx.ch1.viewrays[2], ray_topleft.raw);
		vec3s ray_topright;
		glm_vec3_copy(&gctx.ch1.viewrays[2 + 5], ray_topright.raw);
		vec3s ray_botright;
		glm_vec3_copy(&gctx.ch1.viewrays[2 + 10], ray_botright.raw);
		vec3s ray_botleft;
		glm_vec3_copy(&gctx.ch1.viewrays[2 + 15], ray_botleft.raw);

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
		vec2s topleft = {-1, 1};
		vec2s topright = {1, 1};
		vec2s botright = {1, -1};
		vec2s botleft = {-1, -1};

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
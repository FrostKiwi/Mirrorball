#include "main.h"

#define COLOR_TOPLEFT \
	(vec3) { 1.0f, 0.0f, 1.0f }
#define COLOR_TOPRIGHT \
	(vec3) { 1.0f, 1.0f, 0.0f }
#define COLOR_BOTLEFT \
	(vec3) { 0.0f, 1.0f, 1.0f }
#define COLOR_BOTRIGHT \
	(vec3) { 1.0f, 1.0f, 0.0f }

/* Interpolates and projects the border points for a nice little vizualization
   to explain the projection mapping */
void interpolate_border_points(vec3 a, vec3 b, int subdiv,
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
		glUniform2f(gctx.border_shader.transform, uv_proj[0], uv_proj[1]);
		glUniform3fv(gctx.border_shader.color, 1, color);
		/* Draw small quad */
		glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	}
}

void draw_border(int subdiv)
{
	int win_width, win_height;
	SDL_GL_GetDrawableSize(gctx.win, &win_width, &win_height);
	float aspect = (float)win_width / (float)win_height;

	vec4 crop;
	int postcrop_w = gctx.ch1.img.w - (gctx.ch1.crop.left + gctx.ch1.crop.right);
	int postcrop_h = gctx.ch1.img.h - (gctx.ch1.crop.top + gctx.ch1.crop.bot);
	crop[0] = (1.0 / gctx.ch1.img.w) * gctx.ch1.crop.left;
	crop[1] = (1.0 / gctx.ch1.img.h) * gctx.ch1.crop.top;
	crop[2] = (1.0 / gctx.ch1.img.w) * postcrop_w;
	crop[3] = (1.0 / gctx.ch1.img.h) * postcrop_h;

	/* Border shader preperation */
	vec3 ray_topleft;
	glm_vec3_copy(&gctx.ch1.viewrays[2], ray_topleft);
	vec3 ray_topright;
	glm_vec3_copy(&gctx.ch1.viewrays[2 + 5], ray_topright);
	vec3 ray_botright;
	glm_vec3_copy(&gctx.ch1.viewrays[2 + 10], ray_botright);
	vec3 ray_botleft;
	glm_vec3_copy(&gctx.ch1.viewrays[2 + 15], ray_botleft);

	glUseProgram(gctx.border_shader.shader);
	glBindBuffer(GL_ARRAY_BUFFER, gctx.border_shader.quadvbo);
	glEnableVertexAttribArray(gctx.border_shader.vtx);

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

	glUniform1f(gctx.border_shader.scale, 0.01);
	glVertexAttribPointer(gctx.border_shader.vtx, 2, GL_FLOAT, GL_FALSE, 2 * sizeof(float), 0);

	/* Should use instanced rendering */
	/* Top */
	interpolate_border_points(ray_topleft, ray_topright, subdiv * aspect,
							  COLOR_TOPLEFT, COLOR_TOPRIGHT);
	/* Right */
	interpolate_border_points(ray_topright, ray_botright, subdiv,
							  COLOR_TOPRIGHT, COLOR_BOTRIGHT);
	/* Bottom */
	interpolate_border_points(ray_botright, ray_botleft, subdiv * aspect,
							  COLOR_BOTRIGHT, COLOR_BOTLEFT);
	/* Left */
	interpolate_border_points(ray_botleft, ray_topleft, subdiv,
							  COLOR_BOTLEFT, COLOR_TOPLEFT);
	/* Diagonal, Bottom-left -> Top-right */
	interpolate_border_points(ray_botleft, ray_topright, subdiv * aspect * GLM_SQRT2,
							  COLOR_BOTLEFT, COLOR_TOPRIGHT);
	/* Diagonal, Top-left -> Bottom-right */
	interpolate_border_points(ray_topleft, ray_botright, subdiv * aspect * GLM_SQRT2,
							  COLOR_TOPLEFT, COLOR_BOTRIGHT);
	glDisableVertexAttribArray(gctx.border_shader.vtx);
}
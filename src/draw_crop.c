#include "main.h"

void draw_crop()
{
	int win_width, win_height;
	SDL_GL_GetDrawableSize(gctx.win, &win_width, &win_height);

	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, gctx.ch1.img.tex);
	glUseProgram(gctx.crop_shader.shader);
	vec4 crop;
	int postcrop_w = gctx.ch1.img.w - (gctx.ch1.crop.left + gctx.ch1.crop.right);
	int postcrop_h = gctx.ch1.img.h - (gctx.ch1.crop.top + gctx.ch1.crop.bot);
	crop[0] = (1.0 / gctx.ch1.img.w) * gctx.ch1.crop.left;
	crop[1] = (1.0 / gctx.ch1.img.h) * gctx.ch1.crop.top;
	crop[2] = (1.0 / gctx.ch1.img.w) * postcrop_w;
	crop[3] = (1.0 / gctx.ch1.img.h) * postcrop_h;

	glUniform4fv(gctx.crop_shader.crop, 1, &crop[0]);

	glBindBuffer(GL_ARRAY_BUFFER, gctx.bgvbo);
	glEnableVertexAttribArray(gctx.crop_shader.vtx);
	glEnableVertexAttribArray(gctx.crop_shader.coord);
	glVertexAttribPointer(gctx.crop_shader.vtx, 2, GL_FLOAT, GL_FALSE, 4 * sizeof(float), 0);
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

	glUniform1f(gctx.crop_shader.mask_toggle, gctx.mask_toggle ? 1.0 : 0.0);
	/* Draw fullscreen quad */
	glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	glDisableVertexAttribArray(gctx.crop_shader.vtx);
	glDisableVertexAttribArray(gctx.crop_shader.coord);
	glUseProgram(0);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, 0);
}
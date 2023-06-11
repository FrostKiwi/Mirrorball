#include "main.h"

void draw_project()
{
	vec4 crop;
	crop[0] = (1.0 / gctx.ch1.img.w) *
			  (gctx.ch1.img.w / 2.0 +
			   gctx.ch1.crop.left / 2.0 -
			   gctx.ch1.crop.right / 2.0);
	crop[1] = (1.0 / gctx.ch1.img.h) *
			  (gctx.ch1.img.h / 2.0 +
			   gctx.ch1.crop.top / 2.0 -
			   gctx.ch1.crop.bot / 2.0);
	crop[2] = (1.0 / gctx.ch1.img.w) *
			  (gctx.ch1.img.w -
			   gctx.ch1.crop.left / 1.0 -
			   gctx.ch1.crop.right / 1.0);
	crop[3] = (1.0 / gctx.ch1.img.h) *
			  (gctx.ch1.img.h -
			   gctx.ch1.crop.top / 1.0 -
			   gctx.ch1.crop.bot / 1.0);
	glUseProgram(gctx.projection_shader.shader);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, gctx.ch1.img.tex);
	glEnableVertexAttribArray(gctx.projection_shader.pos);
	glEnableVertexAttribArray(gctx.projection_shader.viewray);
	glUniform4fv(gctx.projection_shader.crop, 1, crop);
	glBindBuffer(GL_ARRAY_BUFFER, gctx.rayvbo);
	glBufferData(GL_ARRAY_BUFFER, sizeof(gctx.ch1.viewrays), gctx.ch1.viewrays,
				 GL_DYNAMIC_DRAW);
	glVertexAttribPointer(gctx.projection_shader.pos, 2, GL_FLOAT, GL_FALSE,
						  5 * sizeof(float), 0);
	glVertexAttribPointer(gctx.projection_shader.viewray, 3, GL_FLOAT, GL_FALSE,
						  5 * sizeof(float), (void *)(2 * sizeof(float)));
	glUniform1f(gctx.projection_shader.scaler, gctx.ch1.fov);
	/* Draw fullscreen quad */
	glDrawArrays(GL_TRIANGLE_FAN, 0, 4);
	glDisableVertexAttribArray(gctx.projection_shader.pos);
	glDisableVertexAttribArray(gctx.projection_shader.viewray);
	glBindBuffer(GL_ARRAY_BUFFER, 0);
	glUseProgram(0);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, 0);
}
#include "main.h"

void media_setup(uint8_t *buffer, size_t buffer_size, int width, int height)
{
	glDeleteTextures(1, &gctx.ch1.img.tex);
	glGenTextures(1, &gctx.ch1.img.tex);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, gctx.ch1.img.tex);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	gctx.ch1.img.w = width;
	gctx.ch1.img.h = height;
	gctx.ch1.img.buf = buffer;

	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA, width, height, 0,
				 GL_RGBA, GL_UNSIGNED_BYTE, buffer);

	gctx.cam.cam_rotation = vec3_zero();
	gctx.ch1.rotation = vec3_zero();
	gctx.ch1.fov_deg = 360;
	gctx.cam.fov = glm_rad(100);
	gctx.ch1.crop.bot = 0;
	gctx.ch1.crop.top = 0;
	gctx.ch1.crop.left = 0;
	gctx.ch1.crop.right = 0;
}
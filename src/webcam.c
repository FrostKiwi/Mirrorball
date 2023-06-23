#include "main.h"

EMSCRIPTEN_KEEPALIVE
void setup_webcam(uint8_t *buffer, size_t buffer_size, int width, int height)
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

	switch (buffer_size / (width * height))
	{
	case 3:
		gctx.ch1.img.channels = GL_RGB;
		break;
	case 4:
		gctx.ch1.img.channels = GL_RGBA;
		break;
	default:
		gctx.ch1.img.channels = GL_RGBA;
		puts("Buffer size and image dimensions don't match. Something's wrong");
	}

	glTexImage2D(GL_TEXTURE_2D, 0, gctx.ch1.img.channels, width, height, 0,
				 gctx.ch1.img.channels, GL_UNSIGNED_BYTE, buffer);
}

/* TODO: Don't regenerate the texture! Just update it. */
EMSCRIPTEN_KEEPALIVE int process_webcam()
{
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, gctx.ch1.img.tex);
	glTexSubImage2D(GL_TEXTURE_2D, 0, 0, 0, gctx.ch1.img.w, gctx.ch1.img.h,
					gctx.ch1.img.channels, GL_UNSIGNED_BYTE, gctx.ch1.img.buf);

	return 1;
}
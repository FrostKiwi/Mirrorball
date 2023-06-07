#include "main.h"
#include <SDL2/SDL_image.h>

extern struct global_context gctx;

int load_file(uint8_t *buffer, size_t size)
{
	SDL_Surface *surface;
	SDL_RWops *rw;

	rw = SDL_RWFromMem(buffer, size);
	if (rw == NULL)
	{
		SDL_Log("Unable to create SDL_RWops structure: %s", SDL_GetError());
		return -1;
	}

	surface = IMG_Load_RW(rw, 1);
	if (surface == NULL)
	{
		SDL_Log("Unable to load image: %s", IMG_GetError());
		return -1;
	}

	glDeleteTextures(1, &gctx.ch1.img.tex);
	glGenTextures(1, &gctx.ch1.img.tex);
	glActiveTexture(GL_TEXTURE0);
	glBindTexture(GL_TEXTURE_2D, gctx.ch1.img.tex);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);
	gctx.ch1.img.w = surface->w;
	gctx.ch1.img.h = surface->h;

	GLenum format;
	if (surface->format->BytesPerPixel == 4)
	{
		format = GL_RGBA;
	}
	else
	{
		format = GL_RGB;
	}

	glTexImage2D(GL_TEXTURE_2D, 0, format, surface->w, surface->h, 0, format, GL_UNSIGNED_BYTE, surface->pixels);
	SDL_FreeSurface(surface);

	glm_vec3_zero(gctx.cam.cam_rotation);
	glm_vec3_zero(gctx.ch1.rotation);
	gctx.ch1.fov_deg = 360;
	gctx.cam.fov = glm_rad(100);
	gctx.ch1.crop.bot = gctx.ch1.crop.top = gctx.ch1.crop.left = gctx.ch1.crop.right = 0;

	return 1;
}
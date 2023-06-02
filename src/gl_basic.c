#include "gl_basic.h"
#include <SDL2/SDL_image.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char *load_shader_source(const char *shader_file_path)
{
	char *buffer = NULL;
	size_t length;
	FILE *f = fopen(shader_file_path, "rb");

	if (f)
	{
		fseek(f, 0, SEEK_END);
		length = ftell(f);
		fseek(f, 0, SEEK_SET);
		buffer = malloc(length + 1);
		if (buffer)
		{
			fread(buffer, 1, length, f);
		}
		fclose(f);
	}

	if (buffer)
	{
		buffer[length] = '\0';
		return buffer;
	}
	else
	{
		printf("Error! Failed to load shader file: %s\n", shader_file_path);
		exit(-1);
	}
}

GLuint compile_shader(const char *vert_shader_file_path,
					  const char *fragment_shader_file_path)
{
	char log[512];
	GLuint fragment_shader, shader_program, vertex_shader;
	GLint success;

	char *vertex_shader_source = load_shader_source(vert_shader_file_path);
	char *fragment_shader_source = load_shader_source(fragment_shader_file_path);

	/* Vertex shader */
	vertex_shader = glCreateShader(GL_VERTEX_SHADER);
	/* Just cast to const to silence the warnings. Not exactly elegant :S */
	glShaderSource(vertex_shader, 1,
				   (const GLchar *const *)&vertex_shader_source, NULL);
	glCompileShader(vertex_shader);
	glGetShaderiv(vertex_shader, GL_COMPILE_STATUS, &success);
	if (!success)
	{
		glGetShaderInfoLog(vertex_shader, 512, NULL, log);
		printf("Error! Vertex shader compilation failed!\n%s\n", log);
	}
	/* Fragment shader */
	fragment_shader = glCreateShader(GL_FRAGMENT_SHADER);
	/* Just cast to const to silence the warnings. Not exactly elegant :S */
	glShaderSource(fragment_shader, 1,
				   (const GLchar *const *)&fragment_shader_source, NULL);
	glCompileShader(fragment_shader);
	glGetShaderiv(fragment_shader, GL_COMPILE_STATUS, &success);
	if (!success)
	{
		glGetShaderInfoLog(fragment_shader, 512, NULL, log);
		printf("Error! Fragment shader compilation failed!\n%s\n", log);
	}
	/* Link shaders */
	shader_program = glCreateProgram();
	glAttachShader(shader_program, vertex_shader);
	glAttachShader(shader_program, fragment_shader);
	glLinkProgram(shader_program);
	glGetProgramiv(shader_program, GL_LINK_STATUS, &success);
	if (!success)
	{
		glGetProgramInfoLog(shader_program, 512, NULL, log);
		printf("Error! Shader linking failed!\n%s\n", log);
	}
	/* Cleanup */
	glDeleteShader(vertex_shader);
	glDeleteShader(fragment_shader);
	free(vertex_shader_source);
	free(fragment_shader_source);
	return shader_program;
}

struct image load_texture(char *file, struct image img)
{
	SDL_Surface *surface = IMG_Load(file);
	if (!surface)
	{
		printf("IMG_Load: %s\n", IMG_GetError());
		// handle error
	}

	glDeleteTextures(1, &img.tex);
	glGenTextures(1, &img.tex);
	glBindTexture(GL_TEXTURE_2D, img.tex);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_CLAMP_TO_EDGE);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
	glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

	img.w = surface->w;
	img.h = surface->h;

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
	return img;
}
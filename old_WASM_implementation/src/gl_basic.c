#include "gl_basic.h"
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

GLuint compile_shader(const char *vert_shader_path,
					  const char *fragment_shader_path)
{
	char log[512];
	GLuint fragment_shader, shader_program, vertex_shader;
	GLint success;

	char *vertex_shader_source = load_shader_source(vert_shader_path);
	char *fragment_shader_source = load_shader_source(fragment_shader_path);

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

void print_glinfo()
{
	int max_tex;
	printf("OpenGL Version:\t%s\n",
		   (char *)glGetString(GL_VERSION));
	printf("Vendor:\t\t%s\n",
		   (char *)glGetString(GL_VENDOR));
	printf("Renderer:\t%s\n",
		   (char *)glGetString(GL_RENDERER));
	printf("GLSL Version:\t%s\n",
		   (char *)glGetString(GL_SHADING_LANGUAGE_VERSION));
	glGetIntegerv(GL_MAX_TEXTURE_SIZE, &max_tex);
	printf("Max tex-size:\t2D: %d px²\n", max_tex);
}
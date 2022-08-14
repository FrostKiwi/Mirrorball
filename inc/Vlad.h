               /*/         | | //      / / | |
        \ \   / /| __ _  __| | ___    / /(_) |__  _ __ __ _ _ __ _   _
         \ \ / / |/ _` |/ _` |/ __|  / / | | '_ \| '__/ _` | '__| | | |
          \ V /| | (_| | (_| |\__ \ / /__| | |_) | | | (_| | |  | |_| |
           \_/ |_|\__,_|\__,_||___/ \____/_|_.__/|_|  \__,_|_|   \__, |
                                                                 |___*/
/* Function Collection of Wladislav Artsimovich ( git@frost.kiwi )
   Aquired over the years with blood, sweat and tears.

   Let's talk rules. Better follow them ٩(ఠ益ఠ)۶
   This library is segmented by dependency. Segments are loaded with
   #define VLAD_???. Only load what you need, check for the listed dependencies.
   Like stb libraries, it's header-only and needs to defined with
   #define VLAD_IMPLEMENTATION *exactly once*, in *only one* translation unit!

   === Options and Dependencies ===
   VLAD_BASIC - No Dependencies ( On by default )
	- ipow: Raises int by exp
	- next_pot: give next power of 2
	- fading_average: exponential rolling average, state-less approximation
	- lerp: basic linear interpolation based on percentage
	- lerp_vec2: ditto, but with a vec2 struct as input
	- lerp_2d_x_in: 2D Linear interpolation based on interp point's X coord
	- ANSI color defines

   VLAD_STD - C Standard Library
	- idigits: counts digits of an int
	- Vlad String: Custom implementation of Strings
	*Please don't use it* It works, but is insecure.
	Just use sds like a normal person ( https://github.com/antirez/sds )
	Or use chad string a meme person ( https://github.com/skullchap/chadstr )
	
   VLAD_GRAPHICS - cglm ( https://github.com/recp/cglm ), linking of -lm
	- hsv_to_rgb: Highly Optimized conversion
	- hsv_to_rgb_fullbright: Faster, use *only* for Value + Saturation = 100%
	- rgb_to_hsv: Highly Optimized conversion

   VLAD_OPENGL - OpenGL (duh), C-STD, stb_image, stb_image_write
   GL Functions are bound via glew in this case. You can change that.
	- gpu_img_load: Upload texture to GPU from memory
	- compile_shader: Compiles shader, prints errors to stdout
	- print_glinfo: Print current Context Infromation
	- gl_debug_callback: Debug callback for KHR_DEBUG
	- glScreenShot: Save Screenshot to disk
*/

#ifndef VLAD_H
#define VLAD_H
#define VLAD_BASIC

#ifdef VLAD_BASIC
struct vl_vec2{
    float x;
    float y;
};

/* Raise int by exp */
int ipow(int base, int exp);

/* get the next higher power of 2 */
/* Devised by Sean Anderson in 2001
   Also by Pete Hart and William Lewis in 1997, though in a different context */
int next_pot(int v);

/* Approximate exponential moving average */
/* alpha approximates a 1/N average Window. N=100, 1/100 = 0.01 */
/* so alpha 0.01 approximates the exponential average of the last 100 values */
/* I wrote it based on a wikipedia entry,
   so technically the credit goes to someone else. */
float fading_average(double alpha, double old_average, double new_sample);

/* Basic Linear Interpolation, 1-Dimensional */
float lerp(float a, float b, float f);

/* Basic Linear Interpolation, 1-Dimensional */
float lerp_vec2(struct vl_vec2, float f);

/* Linear Interpolation, 2-Dimensional X as input */
/* Find Y based on X as positioned between a and b */
/*
       |         ,-'''-.
       |      ,-'       `-.
   A.y |    O'             `.
       |  ,'                 `.
   Yout| /         O           \
       |/                       \
   ----+---A.x----Xin------------\----B.x-
       |                          \
       |                           \
       |                            `.
   B.y |                              `O
       |                                `-.
*/
float lerp_2d_x_in(struct vl_vec2 A, struct vl_vec2 B, float Xin);

/* ANSI Colors */
#define TXT_DARKWHITE "\033[37m"
#define TXT_DARKYELLOW "\033[33m"
#define TXT_DARKGREEN "\033[32m"
#define TXT_DARKBLUE "\033[34m"
#define TXT_DARKCYAN "\033[36m"
#define TXT_DARKRED "\033[31m"
#define TXT_DARKMAGENTA "\033[35m"
#define TXT_DARKBLACK "\033[30m"
#define TXT_WHITE "\033[97m"
#define TXT_YELLOW "\033[93m"
#define TXT_GREEN "\033[92m"
#define TXT_BLUE "\033[94m"
#define TXT_CYAN "\033[96m"
#define TXT_RED "\033[91m"
#define TXT_MAGENTA "\033[95m"
#define TXT_BLACK "\033[90m"
#define TXT_OFF "\033[0m"

#ifndef RESDEF
#define RESDEF
struct resource {
    const char * pnt;
    const int size;
};
#endif

#endif /* VLAD_BASIC */

#ifdef VLAD_STD
/* Functions that depend only on the C standard library in some way */
#include <limits.h>
#include <stdio.h>
#include <stdlib.h>
#include <stdarg.h>

/* Count digits of int */
int idigits (int n);

/* Vlad's String implementation. JESUS CHRIST DON'T USE IT.
   I mean it works, but DON'T USE IT.
   Valgrind cries tears of insecure code. */
/* Just use sds ( https://github.com/antirez/sds ) */

/* Vlad String Macros */
#define vstr_orig(v_ptr) (size_t *)(v_ptr - sizeof(size_t))
#define vstr_free(v_ptr) free(vstr_orig(v_ptr))
#define vstr_init vstr_size(NULL, 0)

/* Size the String */
char * vstr_size(char **ref, size_t str_size);

/* Wrapper around printf */
void vstr_print(char ** string,  const char * format, ... );
#endif	/* VLAD_STD */

#ifdef VLAD_GRAPHICS
#include "cglm/cglm.h"
#include "math.h"
/* Hue goes from 0 to 1, neither DEG nor RAD */
/* Original design by Ian Taylor, who worked on the XBox 360 GPU */
void hsv_to_rgb(vec3 hsv, vec3 rgb);

/* Early out verision, if V and S at 100% */
/* Superuseful for drawing rainbows with good performance */
/* Hue goes from 0 to 1, neither DEG nor RAD */
/* Original design by Ian Taylor, who worked on the XBox 360 GPU */
void hsv_to_rgb_fullbright(vec3 hsv, vec3 rgb);

/* Hue goes from 0 to 1, neither DEG nor RAD */
/* Original design by Sam Hocevar, ternary branch variant by Emil Persson */
void rgb_to_hsv(vec3 rgb, vec3 hsv);
#endif	/* VLAD_GRAPHICS */

#ifdef VLAD_OPENGL
#include <stdio.h>
#include <stdbool.h>
#include <time.h>
#include <unistd.h>
#include <GL/glew.h>
#include "stb_image.h"
#include "stb_image_write.h"
#include "assert.h"

struct vl_texture {
    GLuint pnt;
    int width;
    int height;
    GLint gpu_format;
};

/* Upload texture to GPU */
struct vl_texture gpu_img_upload(struct resource res);

/* Compile Shader */
GLint compile_shader(const char *vert_shader_source, int vsize,
		     const char *fragment_shader_source, int fsize);

/* Print OpenGL information of the current context. */
/* Set bool extensions to true if you want the list of extension as well*/
void print_glinfo();

/* OpenGL Debug callback function */
/* glEnable(GL_DEBUG_OUTPUT);
   glDebugMessageCallback(gl_debug_callback, NULL); */
void gl_debug_callback(GLenum source, GLenum type, GLuint id, GLenum severity,
		      GLsizei length, GLchar const* message,
		       void const* user_param);

/* Save Screenshot to disk, call *BEFORE* swapping backbuffer */
/* This command presumes, glFinish() */
enum{VL_PNG, VL_PNG_ALPHA, VL_JPG, VL_RAW, VL_RAW_ALPHA};
void glScreenShot(char * filename, int width, int height, int format);
#endif /* VLAD_OPENGL */

#endif /* VLAD_H */

#ifdef VLAD_IMPLEMENTATION
#ifdef VLAD_BASIC

int ipow(int base, int exp)
{
    int result = 1;
    for(;;){
	if (exp & 1) result *= base;
	exp >>= 1;
	if(!exp) break;
	base *= base;
    }
    return result;
}

int next_pot(int v)
{
    v--;
    v |= v >> 1;
    v |= v >> 2;
    v |= v >> 4;
    v |= v >> 8;
    v |= v >> 16;
    v++;
    return v;
}

float fading_average(double alpha, double old_average, double new_sample)
{
    return alpha * new_sample + (1.0-alpha) * old_average;
}

float lerp(float a, float b, float f)
{
    return a + f * (b - a);
}

float lerp_vec2(struct vl_vec2 p, float f)
{
    return p.x + f * (p.y - p.x);
}

float lerp_2d_x_in(struct vl_vec2 A, struct vl_vec2 B, float Xin)
{
    return (Xin - A.x) * (B.y - A.y) / (B.x - A.x) + A.y;
}

#endif /* VLAD_BASIC */

#ifdef VLAD_STD
int idigits (int n)
{
    unsigned int num = abs(n);
    unsigned int x, i;
    for (x=10, i=1; ; x*=10, i++) {
        if (num < x)
            return i;
        if (x > INT_MAX/10)
            return i+1;
    }
}

char * vstr_size(char **ref, size_t str_size)
{
    if (ref == NULL){
	/* Init a new vstr, even if no Pointer given */
	size_t malloc_size = next_pot(sizeof(size_t) + 1);
	void * malloc_ptr = malloc(malloc_size);
	*(size_t *)malloc_ptr = malloc_size - sizeof(size_t);
	*(char *)(malloc_ptr + sizeof(size_t)) = '\0';
	return malloc_ptr + sizeof(size_t);
    } else if (*ref == NULL){
	/* Init a new vstr */
	size_t malloc_size = next_pot(sizeof(size_t) + ++str_size);
	void * malloc_ptr = malloc(malloc_size);
	*(size_t *)malloc_ptr = malloc_size - sizeof(size_t);
	*ref = malloc_ptr + sizeof(size_t);
	return *ref;
    } else {
	if (*vstr_orig(*ref) < ++str_size || *vstr_orig(*ref) > ++str_size*4){
	    void * realloc_ptr;
	    size_t realloc_size = next_pot(sizeof(size_t) + ++str_size);
	    realloc_ptr = realloc(vstr_orig(*ref), realloc_size);
	    *(size_t *)realloc_ptr = realloc_size - sizeof(size_t);
	    *ref = realloc_ptr + sizeof(size_t);
	    return *ref;
	}
	/* No actions performed */
	return NULL;
    }
}

void vstr_print(char ** string,  const char * format, ... )
{
  va_list args;
  va_start(args, format);
  size_t size = vsnprintf(NULL, 0, format, args);
  vstr_size(string, size);
  va_end(args);

  va_start(args, format);
  vsnprintf(*string, size+1, format, args);
  va_end(args);
}
#endif	/* VLAD_STD */

#ifdef VLAD_GRAPHICS

void hsv_to_rgb(vec3 hsv, vec3 rgb)
{
    rgb[0] = fabs(hsv[0] * 6.0f - 3.0f) - 1.0f;
    rgb[1] = 2.0f - fabs(hsv[0] * 6.0f - 2.0f);
    rgb[2] = 2.0f - fabs(hsv[0] * 6.0f - 4.0f);
    glm_vec3_clamp(rgb, 0.0f, 1.0f);
    glm_vec3_subs(rgb, 1.0f, rgb);
    glm_vec3_scale(rgb, hsv[1], rgb);
    glm_vec3_adds(rgb, 1.0f, rgb);
    glm_vec3_scale(rgb, hsv[2], rgb);
}

void hsv_to_rgb_fullbright(vec3 hsv, vec3 rgb)
{
    rgb[0] = fabs(hsv[0] * 6.0f - 3.0f) - 1.0f;
    rgb[1] = 2.0f - fabs(hsv[0] * 6.0f - 2.0f);
    rgb[2] = 2.0f - fabs(hsv[0] * 6.0f - 4.0f);
    glm_vec3_clamp(rgb, 0.0f, 1.0f);
}

void rgb_to_hsv(vec3 rgb, vec3 hsv)
{
    float *p = (rgb[1] < rgb[2]) ? (vec4){rgb[2], rgb[1], -1.0f,  2.0f / 3.0f} :
                                   (vec4){rgb[1], rgb[2],  0.0f, -1.0f / 3.0f};
    float *q = (rgb[0] < p[0]) ?
	(vec4){p[0], p[1], p[3], rgb[0]} : (vec4){rgb[0], p[1], p[2], p[0]};
    float d = q[0] - (q[3] < q[1] ? q[3] : q[1]);
    hsv[0] = fabs(q[2] + (q[3] - q[1]) / (6.0f * d + 1.0e-10f));
    hsv[1] = d / (q[0] + 1.0e-10f);
    hsv[2] = q[0];
}

#endif	/* VLAD_GRAPHICS */

#ifdef VLAD_OPENGL
struct vl_texture gpu_img_upload(struct resource res)
{
    /* Channel number to -1 to act as an error state */
    struct vl_texture output;
    int img_w, img_h, img_ch;
    GLuint gpu_tex;
    unsigned char *cpu_tex = stbi_load_from_memory( (void *)res.pnt, res.size,
						    &img_w, &img_h, &img_ch, 0);

    assert(cpu_tex /* Image load fail, reason printed on ignore */);
    if(!cpu_tex) puts(stbi_failure_reason());
    output.width = img_w;
    output.height = img_h;

    glGenTextures(1, &gpu_tex);
    glBindTexture(GL_TEXTURE_2D, gpu_tex);
    output.pnt = gpu_tex;
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_S, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_WRAP_T, GL_REPEAT);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MIN_FILTER, GL_LINEAR);
    glTexParameteri(GL_TEXTURE_2D, GL_TEXTURE_MAG_FILTER, GL_LINEAR);

    switch(img_ch){
    case 1:
    {
	const GLint Swizzle[] = {GL_RED, GL_RED, GL_RED, GL_ALPHA};
	glTexParameteriv(GL_TEXTURE_2D, GL_TEXTURE_SWIZZLE_RGBA, Swizzle);
	/* GRAY */
	glTexImage2D(GL_TEXTURE_2D, 0, GL_R8, img_w, img_h, 0, GL_RED,
		     GL_UNSIGNED_BYTE, cpu_tex);
	output.gpu_format = GL_R8;
	break;
    }
    case 2:
    {
	/* GRAY Alpha*/
	const GLint Swizzle[] = {GL_RED, GL_RED, GL_RED, GL_GREEN};
	glTexParameteriv(GL_TEXTURE_2D, GL_TEXTURE_SWIZZLE_RGBA, Swizzle);
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RG8, img_w, img_h, 0, GL_RG,
		     GL_UNSIGNED_BYTE, cpu_tex);
	output.gpu_format = GL_RG8;
	break;
    }
    case 3:
	/* RGB */
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGB8, img_w, img_h, 0, GL_RGB,
		     GL_UNSIGNED_BYTE, cpu_tex);
	output.gpu_format = GL_RGB8;
	break;
    case 4:
	/* RGBA */
	glTexImage2D(GL_TEXTURE_2D, 0, GL_RGBA8, img_w, img_h, 0, GL_RGBA,
		     GL_UNSIGNED_BYTE, cpu_tex);
	output.gpu_format = GL_RGBA8;
	break;
    }

    glBindTexture(GL_TEXTURE_2D, 0);
    stbi_image_free(cpu_tex);
    return output;
}

GLint compile_shader(const char *vert_shader_source, int vsize,
		     const char *fragment_shader_source, int fsize)
{
    char log[512];
    GLint fragment_shader, shader_program, success, vertex_shader;
    /* Vertex shader */
    vertex_shader = glCreateShader(GL_VERTEX_SHADER);
    glShaderSource(vertex_shader, 1, &vert_shader_source, &vsize);
    glCompileShader(vertex_shader);
    glGetShaderiv(vertex_shader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(vertex_shader, 512, NULL, log);
        printf("Error! Vertex shader compilation failed!\n%s\n", log);
    }
    /* Fragment shader */
    fragment_shader = glCreateShader(GL_FRAGMENT_SHADER);
    glShaderSource(fragment_shader, 1, &fragment_shader_source, &fsize);
    glCompileShader(fragment_shader);
    glGetShaderiv(fragment_shader, GL_COMPILE_STATUS, &success);
    if (!success) {
        glGetShaderInfoLog(fragment_shader, 512, NULL, log);
        printf("Error! Fragment shader compilation failed!\n%s\n", log);
    }
    /* Link shaders */
    shader_program = glCreateProgram();
    glAttachShader(shader_program, vertex_shader);
    glAttachShader(shader_program, fragment_shader);
    glLinkProgram(shader_program);
    glGetProgramiv(shader_program, GL_LINK_STATUS, &success);
    if (!success) {
        glGetProgramInfoLog(shader_program, 512, NULL, log);
        printf("Error! Shader linking failed!\n%s\n", log);
    }
    /* Cleanup */
    glDeleteShader(vertex_shader);
    glDeleteShader(fragment_shader);
    return shader_program;
}

void print_glinfo()
{
    int max_tex, max_tex_3D;
    printf(TXT_CYAN "OpenGL Version:\t%s\n" TXT_OFF,
	   (char *)glGetString(GL_VERSION));
    printf(TXT_CYAN "Vendor:\t\t%s\n" TXT_OFF,
	   (char *)glGetString(GL_VENDOR));
    printf(TXT_CYAN "Renderer:\t%s\n" TXT_OFF,
	   (char *)glGetString(GL_RENDERER));
    printf(TXT_CYAN "GLSL Version:\t%s\n" TXT_OFF,
	   (char *)glGetString(GL_SHADING_LANGUAGE_VERSION));
    glGetIntegerv(GL_MAX_TEXTURE_SIZE, &max_tex);
    glGetIntegerv(GL_MAX_3D_TEXTURE_SIZE, &max_tex_3D);
    printf(TXT_CYAN "Max tex-size:\t2D: %d px², 3D: %d px³\n" TXT_OFF,
	   max_tex, max_tex_3D);
}

void gl_debug_callback(GLenum source, GLenum type, GLuint id, GLenum severity,
		      GLsizei length, GLchar const* message,
		      void const* user_param)
{
    char * src_str = NULL;
    char * svr_str = NULL;
    switch (source){
    case GL_DEBUG_SOURCE_API:
	src_str = "API"; break;
    case GL_DEBUG_SOURCE_WINDOW_SYSTEM:
	src_str = "Window System"; break;
    case GL_DEBUG_SOURCE_SHADER_COMPILER:
	src_str = "Shader compiler"; break;
    case GL_DEBUG_SOURCE_THIRD_PARTY:
	src_str = "Third party"; break;
    case GL_DEBUG_SOURCE_APPLICATION:
	src_str = "Application"; break;
    case GL_DEBUG_SOURCE_OTHER:
	src_str = "Other"; break;
    }
    switch (type){
    case GL_DEBUG_TYPE_ERROR:
	puts(TXT_RED "=== OpenGL Debug: Error ===" TXT_OFF);
	break;
    case GL_DEBUG_TYPE_DEPRECATED_BEHAVIOR:
	puts(TXT_YELLOW "=== OpenGL Debug: deprecated behaviour===" TXT_OFF);
	break;
    case GL_DEBUG_TYPE_UNDEFINED_BEHAVIOR:
	puts(TXT_YELLOW "=== OpenGL Debug: undefined behaviour ===" TXT_OFF);
	break;
    case GL_DEBUG_TYPE_PORTABILITY:
	puts(TXT_YELLOW "=== OpenGL Debug: portability ===" TXT_OFF);
	break;
    case GL_DEBUG_TYPE_PERFORMANCE:
	puts(TXT_YELLOW "=== OpenGL Debug: performance ===" TXT_OFF);
	break;
    case GL_DEBUG_TYPE_MARKER:
	puts(TXT_CYAN "=== OpenGL Debug: Marker ===" TXT_OFF);
	break;
    case GL_DEBUG_TYPE_OTHER:
	puts(TXT_CYAN "=== OpenGL Debug: Other ===" TXT_OFF);
	break;
    }
    switch (severity){
    case GL_DEBUG_SEVERITY_NOTIFICATION:
	svr_str = TXT_CYAN "Notification" TXT_OFF; break;
    case GL_DEBUG_SEVERITY_LOW:
	svr_str = TXT_DARKYELLOW "Low" TXT_OFF; break;
    case GL_DEBUG_SEVERITY_MEDIUM:
	svr_str = TXT_YELLOW "Medium" TXT_OFF; break;
    case GL_DEBUG_SEVERITY_HIGH:
	svr_str = TXT_RED "High" TXT_OFF; break;
    }
    printf("Severity: %s - Message origin: %s\n", svr_str, src_str);
    puts(message);
}

void glScreenShot(char * filename, int width, int height, int format)
{
    time_t rawtime;
    struct tm * timeinfo;
    char * full_filename = vstr_init;
    char * extension[] = {".png", ".png",".jpg", ".bin", ".bin"};

    /* File name handling */
    /* If filename NULL, omit prefixing the File with a given name */
    /* Add RGBA / RGB to filename if raw output */
    /* Print Name in filename */
    if(filename) vstr_print(&full_filename, "%s-", filename);
    switch (format){
    case VL_RAW :
	vstr_print(&full_filename, "%sRGB-%dx%d-",full_filename,width,height);
	break;
    case VL_RAW_ALPHA :
	vstr_print(&full_filename, "%sRGBA-%dx%d-",full_filename,width,height);
    }
    time ( &rawtime );
    timeinfo = localtime ( &rawtime );
    vstr_print(&full_filename, "%s%d-%.2d-%.2d_%.2d-%.2d-%.2d%s",
	       full_filename,
	       timeinfo->tm_year+1900,
	       timeinfo->tm_mon,
	       timeinfo->tm_mday,
	       timeinfo->tm_hour,
	       timeinfo->tm_min,
	       timeinfo->tm_sec,
	       extension[format]);

    /* Check if filename exists already */
    if( access( full_filename, F_OK ) == 0 ) {
	vstr_free(full_filename);
	return;
    }

    char * buf;
    if(format == VL_PNG_ALPHA || format == VL_RAW_ALPHA){
	buf = malloc(4 * width * height);
	glReadPixels(0, 0, width, height, GL_RGBA, GL_UNSIGNED_BYTE, &buf[0]);
    } else {
	buf = malloc(3 * width * height);
	glReadPixels(0, 0, width, height, GL_RGB, GL_UNSIGNED_BYTE, &buf[0]);
    }
    stbi_flip_vertically_on_write(true);

    switch (format){
    case VL_PNG:
	stbi_write_png(full_filename, width, height, 3, buf, 0);
	break;
    case VL_PNG_ALPHA:
	stbi_write_png(full_filename, width, height, 4, buf, 0);
	break;
    case VL_JPG :
	stbi_write_jpg(full_filename, width, height, 3, buf, 100);
	break;
    case VL_RAW_ALPHA :
    {
	FILE * fp = fopen(full_filename, "wb");
	for(int y = 0; y < height; ++y)
	    fwrite(buf + (height - 1 - y) * 1 * width * 4, 1, width*4, fp);
	fclose(fp);
    }
    break;
    case VL_RAW :
    {
	FILE * fp = fopen(full_filename, "wb");
	for(int y = 0; y < height; ++y)
	    fwrite(buf + (height - 1 - y) * 1 * width * 3, 1, width*3, fp);
	fclose(fp);
    }
    break;
    }

    /* Cleanup */
    stbi_flip_vertically_on_write(false);
    vstr_free(full_filename);
    free(buf);
    printf("Saved screenshot \"%s\"\n", full_filename);
}
#endif /* VLAD_OPENGL */
#endif /* VLAD_IMPLEMENTATION */

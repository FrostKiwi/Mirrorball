#include <stdio.h>
#include "res.h"
#define VLAD_STD
#define VLAD_OPENGL
#include "Vlad.h"
#include "GL/glew.h"
#include <GLFW/glfw3.h>

/* Global state */
struct{
    GLFWwindow* window;
    int window_w;
    int window_h;
}gctx = {
    /* Init some defaults */
    .window_w = 800,
    .window_h = 600
};

static void error_callback(int e, const char *d)
{
    if(e != 65548)		/* Ignore the Wayland window size error */
    printf("\033[31mError %d: %s\033[0m\n", e, d);
}

static void keypress(GLFWwindow* win, int key, int scancode, int act, int mod)  
{
    /* Escape to close */
    if (key == GLFW_KEY_ESCAPE && act == GLFW_PRESS)
        glfwSetWindowShouldClose(win, GLFW_TRUE);
}

void load_icons(GLFWwindow * window)
{
	GLFWimage images[3];
	images[0].pixels = stbi_load_from_memory((void *)icon48_png.pnt, icon48_png.size, &images[0].width, &images[0].height, NULL, 4);
	images[1].pixels = stbi_load_from_memory((void *)icon32_png.pnt, icon32_png.size, &images[1].width, &images[1].height, NULL, 4);
	images[2].pixels = stbi_load_from_memory((void *)icon16_png.pnt, icon16_png.size, &images[2].width, &images[2].height, NULL, 4);
	glfwSetWindowIcon(window, 3, images);
	stbi_image_free(images[0].pixels);
	stbi_image_free(images[1].pixels);
	stbi_image_free(images[2].pixels);
}

int init(){
    /* Setup GLEW and GLFW */
    glfwSetErrorCallback(error_callback);
    if ( !glfwInit() ) {
	puts(TXT_RED "GLFW could not init." TXT_OFF);	
	return -1;
    }
    gctx.window = glfwCreateWindow(gctx.window_w, gctx.window_h, "Frostorama",
			      NULL, NULL);
    if ( gctx.window == NULL) {
	puts("GLFW couldn't create a window.");
	return -1;
    }
    load_icons(gctx.window);
    glfwMakeContextCurrent(gctx.window);
    glfwSetKeyCallback(gctx.window, keypress);
    glewInit();


    /* Some basic OpenGL Settings */
    print_glinfo();

    glClearColor(0, 0, 0, 0);
    /* Prevents headaches when loading NPOT textures */
    glPixelStorei(GL_UNPACK_ALIGNMENT, 1);
    glPixelStorei(GL_PACK_ALIGNMENT, 1);
    return 0;
}

int main(void){
    if (init() != 0) {
	puts(TXT_RED "Something went wrong, aborting!" TXT_OFF);
	return -1;
    }

    /* Renderloop */
    while (!glfwWindowShouldClose(gctx.window)) {
	glfwPollEvents();
	/* Reset frame */
	glfwGetWindowSize(gctx.window, &gctx.window_w, &gctx.window_h);
        glViewport(0, 0, gctx.window_w, gctx.window_h);
	glClear(GL_COLOR_BUFFER_BIT);
    
	glfwSwapBuffers(gctx.window);
	/* Force GPU sync to keep input delay low, also boost perofrmance
	   on GM45 Laptops like the Thinkpad X200. */
	glFinish();
    }
    return 0;
}

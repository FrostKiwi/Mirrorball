#include <stdio.h>
#include <stdio.h>
#include <stdlib.h>
#include "res.h"
#define VLAD_STD
#define VLAD_OPENGL
#include "Vlad.h"
#include "GL/glew.h"
#include <GLFW/glfw3.h>
#include "nfd.h"
#define NK_INCLUDE_FIXED_TYPES
#define NK_INCLUDE_STANDARD_IO
#define NK_INCLUDE_STANDARD_VARARGS
#define NK_INCLUDE_DEFAULT_ALLOCATOR
#define NK_INCLUDE_VERTEX_BUFFER_OUTPUT
#define NK_INCLUDE_FONT_BAKING
#define NK_KEYSTATE_BASED_INPUT
#include "nuklear.h"
#include "nuklear_glfw_gl3.h"

/* Global state */
struct{
    GLFWwindow* window;
    int window_w;
    int window_h;
    int nk_max_vertex_buffer;
    int nk_max_element_buffer;
}gctx = {
    /* Some defaults */
    .window_w = 800,
    .window_h = 600,
    .nk_max_vertex_buffer = 512 * 1024,
    .nk_max_element_buffer = 128 * 1024
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
    glfwWindowHint(GLFW_TRANSPARENT_FRAMEBUFFER, GLFW_TRUE);
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

    NFD_Init();
    return 0;
}

int main(void){
    if (init() != 0) {
	puts(TXT_RED "Something went wrong, aborting!" TXT_OFF);
	return -1;
    }

    /* Init GUI */
    struct nk_glfw glfw = {0};
    struct nk_context *ctx = nk_glfw3_init(&glfw, gctx.window, NK_GLFW3_INSTALL_CALLBACKS);

    /* Fonts */
    struct nk_font * icons, * droid;
       
    struct nk_font_config cfg_icon = nk_font_config(0);
    struct nk_font_config cfg_font = nk_font_config(0);
    nk_rune ranges_icon[] = {
	0xF07C, 0xF07C, 	/*   */
	0xF083, 0xF083,		/*   */
	0xF0AD, 0xF0AD,		/*   */
	0xF021, 0xF021,		/*   */
	0
    };
    nk_rune ranges_font[] = {
	0x0020, 0x007E,		/* Ascii */
	0x00A1, 0x00FF,		/* Symbols + Umlaute */
	0
    };
    cfg_icon.range = ranges_icon;
    cfg_font.range = ranges_font;
    struct nk_font_atlas *atlas;
    nk_glfw3_font_stash_begin(&glfw, &atlas);
    icons = nk_font_atlas_add_from_memory(atlas, (void *)icons_ttf.pnt,
					  icons_ttf.size, 46, &cfg_icon);
    droid = nk_font_atlas_add_from_memory(atlas, (void *)roboto_ttf.pnt,
					  roboto_ttf.size, 22, &cfg_font);
    nk_glfw3_font_stash_end(&glfw);
    
    nk_style_set_font(ctx, &droid->handle);

/* nfdresult_t result = NFD_OpenDialog(&outPath, filterItem, 1, NULL); */
    /* if (result == NFD_OKAY){ */
    /* 	puts("Success!"); */
    /* 	puts(outPath); */
    /* 	NFD_FreePath(outPath); */
    /* } */
    /* else if (result == NFD_CANCEL){ */
    /* 	puts("User pressed cancel."); */
    /* } */
    /* else { */
    /* 	printf("Error: %s\n", NFD_GetError()); */
    /* 	puts(TXT_RED "Error when opening a file, aborting!" TXT_OFF); */
    /* 	return -1; */
    /* } */

    /* Local Variables for the render loop */
    nfdchar_t *outPath;
    nfdfilteritem_t filterItem[1] = { { "Images", "jpg,jpeg,png,bmp,psd,tga,gif,hdr,pic,ppm,pgm" } };
    struct crop_rect {
	int top;
	int bot;
	int left;
	int right;
    };
    struct crop_rect crop_ch1 = {0, 0, 0, 0};
    struct crop_rect crop_ch2 = {0, 0, 0, 0};
    
    /* Renderloop */
    while (!glfwWindowShouldClose(gctx.window)) {
	glfwPollEvents();
	/* Reset frame */
	glfwGetWindowSize(gctx.window, &gctx.window_w, &gctx.window_h);
        glViewport(0, 0, gctx.window_w, gctx.window_h);
	glClear(GL_COLOR_BUFFER_BIT);

	/* Build GUI */
	nk_glfw3_new_frame(&glfw);

	if (nk_begin(ctx, "Image Channel 1", nk_rect(50, 50, 400, 450),
		     NK_WINDOW_BORDER|NK_WINDOW_MOVABLE|NK_WINDOW_SCALABLE|
		     NK_WINDOW_MINIMIZABLE|NK_WINDOW_TITLE)){
	    nk_style_set_font(ctx, &icons->handle);
	    nk_layout_row_dynamic(ctx, 52, 3);
            if (nk_button_label(ctx, "")){
	    }
	    if (nk_button_label(ctx, "")){
	    }
	    if (nk_button_label(ctx, "")){
	    }
	    nk_style_set_font(ctx, &droid->handle);
	    
	    if (nk_tree_push(ctx, NK_TREE_TAB, "Cropping", NK_MINIMIZED)) {
		nk_layout_row_dynamic(ctx, 46, 1);
		nk_style_set_font(ctx, &icons->handle);
		if (nk_button_label(ctx, "")){
		    crop_ch1 = (struct crop_rect){0, 0, 0, 0};
		}
		nk_style_set_font(ctx, &droid->handle);
		nk_layout_row_dynamic(ctx, 30, 4);
		nk_label(ctx, "Top",NK_TEXT_CENTERED);
		nk_label(ctx, "Bottom",NK_TEXT_CENTERED);
		nk_label(ctx, "Left",NK_TEXT_CENTERED);
		nk_label(ctx, "Right",NK_TEXT_CENTERED);
		nk_property_int(ctx, "#", 0, &crop_ch1.top, 540, 1, 1);
		nk_property_int(ctx, "#", 0, &crop_ch1.bot, 540, 1, 1);
		nk_property_int(ctx, "#", 0, &crop_ch1.left, 960, 1, 1);
		nk_property_int(ctx, "#", 0, &crop_ch1.right, 960, 1, 1);
		nk_tree_pop(ctx);
	    }
	    if(nk_tree_push(ctx, NK_TREE_TAB, "Virtual Camera", NK_MINIMIZED)){
		float ratio_two[] = {0.9f, 0.1f};
		nk_label(ctx, "World rotation",NK_TEXT_CENTERED);
		nk_layout_row(ctx, NK_DYNAMIC, 30, 2, ratio_two);
		nk_label(ctx, "X",NK_TEXT_CENTERED);
		nk_label(ctx, "Y",NK_TEXT_CENTERED);
		nk_label(ctx, "Z",NK_TEXT_CENTERED);
		nk_tree_pop(ctx);
	    }
	    if(nk_tree_push(ctx, NK_TREE_TAB, "Color correction", NK_MINIMIZED)){
		nk_label(ctx, "Saturation",NK_TEXT_CENTERED);
		nk_label(ctx, "Gamma",NK_TEXT_CENTERED);
		nk_tree_pop(ctx);
	    }
	    nk_layout_row_dynamic(ctx, 30, 2);
        }	
        nk_end(ctx);
	
	/* Render */
	nk_glfw3_render(&glfw, NK_ANTI_ALIASING_ON, gctx.nk_max_vertex_buffer,
			gctx.nk_max_element_buffer);
    
	glfwSwapBuffers(gctx.window);
	/* Force GPU sync to keep input delay low, also boost perofrmance
	   on GM45 Laptops like the Thinkpad X200. */
	glFinish();
    }

    /* Cleanup */
    NFD_Quit();
    return 0;
}

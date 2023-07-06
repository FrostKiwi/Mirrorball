/*
 * Nuklear - 1.40.8 - public domain
 * no warrenty implied; use at your own risk.
 * authored from 2015-2017 by Micha Mettke
 * emscripten from 2016 by Chris Willcocks
 * OpenGL ES 2.0 from 2017 by Dmitry Hrabrov a.k.a. DeXPeriX
 */
/*
 * ==============================================================
 *
 *                              API
 *
 * ===============================================================
 */
#ifndef NK_SDL_GLES2_H_
#define NK_SDL_GLES2_H_

#include <SDL2/SDL.h>
#include <SDL2/SDL_opengles2.h>

NK_API struct nk_context *nk_sdl_init(SDL_Window *win);
NK_API void nk_sdl_font_stash_begin(struct nk_font_atlas **atlas);
NK_API void nk_sdl_font_stash_end(void);
NK_API int nk_sdl_handle_event(SDL_Event *evt);
NK_API void nk_sdl_render(enum nk_anti_aliasing, int max_vertex_buffer, int max_element_buffer);
NK_API void nk_sdl_shutdown(void);
NK_API void nk_sdl_device_destroy(void);
NK_API void nk_sdl_device_create(void);

#endif
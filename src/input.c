#include "input.h"

void input()
{
    struct nk_context *ctx = gctx.ctx;
    
	SDL_Event evt;
	nk_input_begin(ctx);
	while (SDL_PollEvent(&evt))
	{
		nk_sdl_handle_event(&evt);
		/*
					switch (evt.type)
					{
					case SDL_MOUSEMOTION:


					case SDL_MOUSEWHEEL:
						gctx.fov -= (float)evt.wheel.y * 0.1;

							gctx.fov += evt.mgesture.dDist;
							gctx.fov -= (float)evt.wheel.y;
						  if(evt.type == SDL_MOUSEBUTTONDOWN)
						  gctx.cam.cam_rotation[1] += evt.tfinger.dx * 0.001;
				} */
		switch (evt.type)
		{
			/* 		case SDL_KEYDOWN:
					{
						switch (evt.key.keysym.sym)
						{
						case SDLK_q:
							gctx.fov -= 0.01;
							break;
						case SDLK_e:
							gctx.fov += 0.01;
							break;
						case SDLK_UP:
							gctx.cam.cam_rotation[0] += 0.01;
							if (gctx.cam.cam_rotation[0] > M_PI / 2.0)
								gctx.cam.cam_rotation[0] = M_PI / 2.0;
							if (gctx.cam.cam_rotation[0] < M_PI / -2.0)
								gctx.cam.cam_rotation[0] = M_PI / -2.0;
							break;
						case SDLK_DOWN:
							gctx.cam.cam_rotation[0] -= 0.01;
							if (gctx.cam.cam_rotation[0] > M_PI / 2.0)
								gctx.cam.cam_rotation[0] = M_PI / 2.0;
							if (gctx.cam.cam_rotation[0] < M_PI / -2.0)
								gctx.cam.cam_rotation[0] = M_PI / -2.0;
							break;
						case SDLK_LEFT:	gctx.cam.cam_rotation[1] -= 0.01; break;
						case SDLK_RIGHT: gctx.cam.cam_rotation[1] += 0.01; break;
						}
					} */
		case SDL_FINGERMOTION:
			gctx.cam.cam_rotation[1] += evt.tfinger.dx * 2.0;
			gctx.cam.cam_rotation[0] += evt.tfinger.dy * 2.0;
			break;
		case SDL_MULTIGESTURE:
			gctx.cam.fov -= evt.mgesture.dDist * 4;
			break;
		}
	}
	nk_input_end(ctx);

	if (ctx->input.keyboard.keys[NK_KEY_LEFT].down && !ctx->input.keyboard.keys[NK_KEY_SHIFT].down)
		gctx.cam.cam_rotation[1] += 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_RIGHT].down && !ctx->input.keyboard.keys[NK_KEY_SHIFT].down)
		gctx.cam.cam_rotation[1] -= 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_UP].down)
		gctx.cam.cam_rotation[0] += 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_DOWN].down)
		gctx.cam.cam_rotation[0] -= 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_LEFT].down && ctx->input.keyboard.keys[NK_KEY_SHIFT].down)
		gctx.cam.fov += 0.05;
	if (ctx->input.keyboard.keys[NK_KEY_RIGHT].down && ctx->input.keyboard.keys[NK_KEY_SHIFT].down)
		gctx.cam.fov -= 0.05;

	if (gctx->cam.cam_rotation[0] > GLM_PI / 2.0)
		gctx->cam.cam_rotation[0] = GLM_PI / 2.0;
	if (gctx->cam.cam_rotation[0] < GLM_PI / -2.0)
		gctx->cam.cam_rotation[0] = GLM_PI / -2.0;

	if (!nk_window_is_any_hovered(ctx))
	{
		gctx.cam.fov -= ctx->input.mouse.scroll_delta.y * 0.1;
	}

	if (gctx.cam.fov > gctx.cam.fovmax)
		gctx.cam.fov = gctx.cam.fovmax;
	if (gctx.cam.fov < gctx.cam.fovmin)
		gctx.cam.fov = gctx.cam.fovmin;
}
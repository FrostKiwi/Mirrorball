#include "gui.h"

void gui_debug()
{
	struct nk_context *ctx = gctx.ctx;

	if (nk_begin(ctx, "Debug Info",
				 nk_rect(200 * gctx.interface_mult,
						 200 * gctx.interface_mult,
						 400 * gctx.interface_mult,
						 400 * gctx.interface_mult),
				 NK_WINDOW_BORDER | NK_WINDOW_MOVABLE | NK_WINDOW_SCALABLE |
					 NK_WINDOW_MINIMIZABLE | NK_WINDOW_TITLE))
	{
		/* General WebGL Info */
		if (nk_tree_push(ctx, NK_TREE_TAB, "WebGL Information", NK_MINIMIZED))
		{
			nk_layout_row_dynamic(ctx, 20 * gctx.interface_mult, 2);
			nk_label_colored(ctx, "Version:", NK_TEXT_ALIGN_LEFT,
							 nk_rgb(100, 123, 23));
			nk_label(ctx, gctx.debug.gl.version, NK_TEXT_ALIGN_RIGHT);
			nk_label_colored(ctx, "Vendor:", NK_TEXT_ALIGN_LEFT,
							 nk_rgb(100, 123, 23));
			nk_label(ctx, gctx.debug.gl.vendor, NK_TEXT_ALIGN_RIGHT);
			nk_label_colored(ctx, "Renderer:", NK_TEXT_ALIGN_LEFT,
							 nk_rgb(100, 123, 23));
			nk_label(ctx, gctx.debug.gl.renderer, NK_TEXT_ALIGN_RIGHT);
			nk_label_colored(ctx, "GLSL Version:", NK_TEXT_ALIGN_LEFT,
							 nk_rgb(100, 123, 23));
			nk_label(ctx, gctx.debug.gl.glsl, NK_TEXT_ALIGN_RIGHT);
			nk_label_colored(ctx, "GLSL Version:", NK_TEXT_ALIGN_LEFT,
							 nk_rgb(100, 123, 23));
			nk_labelf(ctx, NK_TEXT_ALIGN_RIGHT, "%d px²", gctx.debug.gl.max_tex);
			if (nk_tree_push(ctx, NK_TREE_TAB, "Extension list", NK_MINIMIZED))
			{
				nk_layout_row_dynamic(ctx, 20 * gctx.interface_mult, 2);
				nk_label_colored(ctx, "Count:", NK_TEXT_ALIGN_LEFT,
								 nk_rgb(100, 123, 23));
				nk_labelf(ctx, NK_TEXT_ALIGN_RIGHT, "%d",
						  gctx.debug.gl.extension_count);
				nk_layout_row_dynamic(ctx, 20 * gctx.interface_mult, 1);
				/* Jump past x null terminators to print whole extension list */
				char *pnt = gctx.debug.gl.extensions;
				for (int x = 0; x < gctx.debug.gl.extension_count; ++x)
				{
					nk_label(ctx, pnt, NK_TEXT_ALIGN_LEFT);
					pnt += strlen(pnt) + 1;
				}
				nk_tree_pop(ctx);
			}
			nk_tree_pop(ctx);
		}
		/* Timing Info */
		if (nk_tree_push(ctx, NK_TREE_TAB, "Framerate / Delays", NK_MINIMIZED))
		{
			nk_layout_row_dynamic(ctx, 18 * gctx.interface_mult, 2);
			/* Calculate FPS via the wrap around time, which should be the real
			   end-to-end input-to-input lag perceived. */
			gctx.debug.time.ticks_cur = SDL_GetTicks();
			gctx.debug.time.ms_cur =
				gctx.debug.time.ticks_cur - gctx.debug.time.ticks_prev;
			gctx.debug.time.ticks_prev = SDL_GetTicks();

			float ms_avg = update_100_average(gctx.debug.time.ms_cur);
			/* Draw the timing info */
			nk_label_colored(ctx, "FPS:", NK_TEXT_ALIGN_LEFT,
							 nk_rgb(100, 123, 23));
			nk_labelf(ctx, NK_TEXT_ALIGN_RIGHT, "%.0f Hz",
					  1000.f / gctx.debug.time.ms_cur);
			nk_label_colored(ctx, "100 Average FPS:", NK_TEXT_ALIGN_LEFT,
							 nk_rgb(100, 123, 23));
			nk_labelf(ctx, NK_TEXT_ALIGN_RIGHT, "%.1f Hz",
					  1000.f / ms_avg);
			nk_label_colored(ctx, "100 Average frame time:", NK_TEXT_ALIGN_LEFT,
							 nk_rgb(100, 123, 23));
			nk_labelf(ctx, NK_TEXT_ALIGN_RIGHT, "%d ms",
					  gctx.debug.time.ms_cur);
			nk_label_colored(ctx, "Smoothed Frame time:", NK_TEXT_ALIGN_LEFT,
							 nk_rgb(100, 123, 23));
			nk_labelf(ctx, NK_TEXT_ALIGN_RIGHT, "%.2f ms",
					  ms_avg);
			nk_tree_pop(ctx);
		}
		/* Image Info */
		if (nk_tree_push(ctx, NK_TREE_TAB, "Image Info", NK_MINIMIZED))
		{
			nk_layout_row_dynamic(ctx, 18 * gctx.interface_mult, 2);
			nk_label_colored(ctx, "Size:", NK_TEXT_ALIGN_LEFT,
							 nk_rgb(100, 123, 23));
			nk_labelf(ctx, NK_TEXT_ALIGN_RIGHT, "%dx%d",
					  gctx.ch1.img.w, gctx.ch1.img.h);

			nk_tree_pop(ctx);
		}
	}
	nk_end(ctx);
}
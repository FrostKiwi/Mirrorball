import { ctx } from './state.js';
import update_camera from './update_camera.js'
import render_crop from './render_crop.js'
import render_border from './render_border.js'
import render_project from './render_projection.js'

export default function render() {
	if (!ctx.gui.crop && !ctx.gui.project)
		ctx.gl.clear(ctx.gl.COLOR_BUFFER_BIT);
	ctx.gl.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);

	/* Devision tree of all combinations of splitscreen rendering and point
	   visualization */
	if (ctx.gui.crop && ctx.gui.project) {
		if (ctx.canvas.width / ctx.canvas.height > 1) {
			/* Horizontal split-screen rendering */
			update_camera(ctx.canvas.width / 2, ctx.canvas.height);
			render_crop(ctx.canvas.width / 2, ctx.canvas.height);
			render_project(ctx.canvas.width / 2, ctx.canvas.height);
			if (ctx.gui.viz) {
				render_border(true, ctx.gui.viz_subdiv,
					ctx.canvas.width / 2, ctx.canvas.height);
				render_border(false, ctx.gui.viz_subdiv,
					ctx.canvas.width / 2, ctx.canvas.height);
			}
		} else {
			/* Vertical Split-screen rendering */
			update_camera(ctx.canvas.width, ctx.canvas.height / 2);
			render_crop(ctx.canvas.width, ctx.canvas.height / 2);
			render_project(ctx.canvas.width, ctx.canvas.height / 2);
			if (ctx.gui.viz) {
				render_border(true, ctx.gui.viz_subdiv,
					ctx.canvas.width, ctx.canvas.height / 2);
				render_border(false, ctx.gui.viz_subdiv,
					ctx.canvas.width, ctx.canvas.height / 2);
			}
		}
	} else {
		/* No Split-screen rendering */
		update_camera(ctx.canvas.width, ctx.canvas.height);
		if (ctx.gui.crop) {
			render_crop(ctx.canvas.width, ctx.canvas.height);
			if (ctx.gui.viz)
				render_border(true, ctx.gui.viz_subdiv,
					ctx.canvas.width, ctx.canvas.height);
		}
		if (ctx.gui.project) {
			render_project();
			if (ctx.gui.viz)
				render_border(false, ctx.gui.viz_subdiv,
					ctx.canvas.width, ctx.canvas.height);
		}
	}
}
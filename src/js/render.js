import { ctx, ctr, redraw } from './state.js';
import update_camera from './update_camera.js'
import render_crop from './render_crop.js'
import render_border from './render_border.js'
import render_project from './render_projection.js'
import render_latlong from './render_latlong.js'
import { resizeCanvasToDisplaySize } from './resize_canvas.js'

export default function render() {
	/* In case of export, set canvas to user provided size */
	if (ctx.export) {
		let width = parseInt(document.getElementById('imageWidthInput').value, 10);
		let height = parseInt(document.getElementById('imageHeightInput').value, 10);
		/* Check if bigger than user set size */
		ctx.canvas.width = (width > ctx.max_texsize) ? ctx.max_texsize : width;
		ctx.canvas.height = (height > ctx.max_texsize) ? ctx.max_texsize : height;
	}

	if (!ctr.tog.crop && !ctr.tog.project)
		ctx.gl.clear(ctx.gl.COLOR_BUFFER_BIT);
	ctx.gl.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);

	/* Decision tree of all combinations of splitscreen rendering, point
	   visualization and the second multifeed channel */
	if (ctr.tog.crop && ctr.tog.project) {
		if (ctx.canvas.width / ctx.canvas.height > 1) {
			/* Horizontal split-screen rendering */
			update_camera(ctx.canvas.width / 2, ctx.canvas.height, ctr.ch1);
			render_crop(ctx.canvas.width / 2, ctx.canvas.height, ctr.ch1);
			render_project(ctx.canvas.width / 2, ctx.canvas.height, ctr.ch1);
			if (ctr.tog.viz) {
				render_border(true, ctr.tog.viz_subdiv,
					ctx.canvas.width / 2, ctx.canvas.height, ctr.ch1);
				render_border(false, ctr.tog.viz_subdiv,
					ctx.canvas.width / 2, ctx.canvas.height, ctr.ch1);
			}
			if (ctr.ch2.alpha) {
				update_camera(ctx.canvas.width / 2, ctx.canvas.height, ctr.ch2);
				render_crop(ctx.canvas.width / 2, ctx.canvas.height, ctr.ch2);
				render_project(ctx.canvas.width / 2, ctx.canvas.height,
					ctr.ch2);
				if (ctr.tog.viz) {
					render_border(true, ctr.tog.viz_subdiv,
						ctx.canvas.width / 2, ctx.canvas.height, ctr.ch2);
					render_border(false, ctr.tog.viz_subdiv,
						ctx.canvas.width / 2, ctx.canvas.height, ctr.ch2);
				}
			}
		} else {
			/* Vertical Split-screen rendering */
			update_camera(ctx.canvas.width, ctx.canvas.height / 2, ctr.ch1);
			render_crop(ctx.canvas.width, ctx.canvas.height / 2, ctr.ch1);
			render_project(ctx.canvas.width, ctx.canvas.height / 2, ctr.ch1);
			if (ctr.tog.viz) {
				render_border(true, ctr.tog.viz_subdiv,
					ctx.canvas.width, ctx.canvas.height / 2, ctr.ch1);
				render_border(false, ctr.tog.viz_subdiv,
					ctx.canvas.width, ctx.canvas.height / 2, ctr.ch1);
			}
			if (ctr.ch2.alpha) {
				update_camera(ctx.canvas.width, ctx.canvas.height / 2,
					ctr.ch2);
				render_crop(ctx.canvas.width, ctx.canvas.height / 2,
					ctr.ch2);
				render_project(ctx.canvas.width, ctx.canvas.height / 2,
					ctr.ch2);
				if (ctr.tog.viz) {
					render_border(true, ctr.tog.viz_subdiv,
						ctx.canvas.width, ctx.canvas.height / 2, ctr.ch2);
					render_border(false, ctr.tog.viz_subdiv,
						ctx.canvas.width, ctx.canvas.height / 2, ctr.ch2);
				}
			}
		}
	} else {
		/* No Split-screen rendering */
		update_camera(ctx.canvas.width, ctx.canvas.height, ctr.ch1);
		if (ctr.tog.crop) {
			render_crop(ctx.canvas.width, ctx.canvas.height, ctr.ch1);
			if (ctr.tog.viz)
				render_border(true, ctr.tog.viz_subdiv,
					ctx.canvas.width, ctx.canvas.height, ctr.ch1);
		}
		if (ctr.tog.project) {
			render_project(ctx.canvas.width, ctx.canvas.height, ctr.ch1);
			if (ctr.tog.viz)
				render_border(false, ctr.tog.viz_subdiv,
					ctx.canvas.width, ctx.canvas.height, ctr.ch1);
		}
		if (ctr.ch2.alpha) {
			update_camera(ctx.canvas.width, ctx.canvas.height, ctr.ch2);
			if (ctr.tog.crop) {
				render_crop(ctx.canvas.width, ctx.canvas.height, ctr.ch2);
				if (ctr.tog.viz)
					render_border(true, ctr.tog.viz_subdiv,
						ctx.canvas.width, ctx.canvas.height, ctr.ch2);
			}
			if (ctr.tog.project) {
				render_project(ctx.canvas.width, ctx.canvas.height, ctr.ch2);
				if (ctr.tog.viz)
					render_border(false, ctr.tog.viz_subdiv,
						ctx.canvas.width, ctx.canvas.height, ctr.ch2);
			}
		}
	}
	
	if (ctx.export) {
		ctx.export = false;
		if (document.querySelector('input[name="projType"]:checked').value == "latlong") {
			render_latlong(ctr.ch1);
			if (ctr.ch2.alpha)
				render_latlong(ctr.ch2);
		}
		screenshot();
		resizeCanvasToDisplaySize();
		ctx.redraw = true;
		redraw();
	}
	ctx.stats.update();
}

function screenshot() {
	const fileTypeValue = document.querySelector('input[name="fileType"]:checked').value;

	let fileExtension = fileTypeValue;
	if (fileTypeValue === 'jpeg') {
		fileExtension = 'jpg';
	}

	let baseName;
	const projType = document.querySelector('input[name="projType"]:checked').value;
	if (projType === "latlong") {
		baseName = "Equirectangular";
	} else if (projType === "rect") {
		baseName = "Screenshot";
	}

	const width = ctx.canvas.width;
	const height = ctx.canvas.height;
	const fileName = `${baseName}_${width}x${height}.${fileExtension}`;

	ctx.canvas.toBlob((blob) => {
		const url = URL.createObjectURL(blob);

		const a = document.createElement('a');
		a.style.display = 'none';
		a.href = url;
		a.download = fileName;

		document.body.appendChild(a);
		a.click();

		document.body.removeChild(a);
		URL.revokeObjectURL(url);
	}, `image/${fileTypeValue}`);
}

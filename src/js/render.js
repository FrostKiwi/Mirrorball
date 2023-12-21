import { ctx, ctr, redraw } from './state.js';
import update_camera from './update_camera.js'
import render_crop from './render_crop.js'
import render_border from './render_border.js'
import render_project from './render_projection.js'
import render_latlong from './render_latlong.js'
import { resizeCanvasToDisplaySize } from './resize_canvas.js'

/* Decision tree for visualization and the 2nd multi-feed channel */
function renderShaders(width, height, channel) {
	if (ctr.tog.latlong)
		render_latlong(channel);
	else {
		update_camera(width, height, channel);
		if (ctr.tog.crop) {
			render_crop(width, height, channel);
			if (ctr.tog.viz)
				render_border(true, ctr.tog.viz_subdiv,
					width, height, channel);
		}
		if (ctr.tog.project) {
			render_project(width, height, channel);
			if (ctr.tog.viz)
				render_border(false, ctr.tog.viz_subdiv,
					width, height, channel);
		}
	}
}

export default function render() {
	/* In case of export, set canvas to user provided size */
	if (ctx.export) {
		let width = parseInt(document.getElementById('imageWidthInput').value, 10);
		let height = parseInt(document.getElementById('imageHeightInput').value, 10);
		/* Check if bigger than user set size */
		ctx.canvas.width = (width > ctx.max_texsize) ? ctx.max_texsize : width;
		ctx.canvas.height = (height > ctx.max_texsize) ? ctx.max_texsize : height;
	}

	ctx.gl.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);
	/* Clear screen if neither option selected, otherwise not needed */
	if (!ctr.tog.crop && !ctr.tog.project)
		ctx.gl.clear(ctx.gl.COLOR_BUFFER_BIT);

	/* Split-screen rendering */
	let quadWidth = ctx.canvas.width;
	let quadHeight = ctx.canvas.height;
	if (ctr.tog.crop && ctr.tog.project)
		if (ctx.canvas.width / ctx.canvas.height < 1)
			/* Vertical Split-screen rendering */
			quadHeight /= 2;
		else
			/* Horizontal split-screen rendering */
			quadWidth /= 2;

	renderShaders(quadWidth, quadHeight, ctr.ch1);
	if (ctr.ch2.alpha)
		renderShaders(quadWidth, quadHeight, ctr.ch2);

	if (ctx.export) {
		ctx.export = false;
		if (document.querySelector('input[name="projType"]:checked').value == "latlong") {
			render_latlong(ctr.ch1);
			if (ctr.ch2.alpha)
				render_latlong(ctr.ch2);
		}
		ctx.gl.finish();
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
	const fileName = ctx.filename;

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

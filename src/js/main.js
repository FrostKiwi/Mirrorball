import ctx from './state.js';
import init_gui from './gui.js';
import { resizeCanvasToDisplaySize, onResize } from './resize.js'
import init_shaders from './init_shaders.js'
import render_crop from './render_crop.js'
import render_project from './render_projection.js'
import update_camera from './update_camera.js'
import render_border from './render_border.js'

ctx.canvas = document.querySelector("canvas");
/* Since we draw over the whole screen, no need to flush */
ctx.gl = ctx.canvas.getContext('webgl', { preserveDrawingBuffer: false });

function main() {
	if (ctx.gl)
		console.log(
			"WebGL Version: " + ctx.gl.getParameter(ctx.gl.VERSION) + '\n' +
			"Vendor: " + ctx.gl.getParameter(ctx.gl.VENDOR) + '\n' +
			"Renderer: " + ctx.gl.getParameter(ctx.gl.RENDERER) + '\n' +
			"GLSL Version: " +
			ctx.gl.getParameter(ctx.gl.SHADING_LANGUAGE_VERSION) + '\n' +
			"Max tex-size: " +
			ctx.gl.getParameter(ctx.gl.MAX_TEXTURE_SIZE) + "px²");
	else {
		console.error("No WebGl context received.");
		return;
	}

	init();
	requestAnimationFrame(animate);
}

function init() {
	ctx.canvasToDisplaySizeMap = new Map([[ctx.canvas, [300, 150]]]);
	const resizeObserver = new ResizeObserver(onResize);
	resizeObserver.observe(ctx.canvas, { box: 'content-box' });

	init_gui();
	init_shaders(ctx, ctx.gl);
	/* Add the stats */
	document.body.appendChild(ctx.stats.dom);

	ctx.gl.clearColor(0, 0, 0, 1);
	/* Prevents headaches when loading NPOT textures */
	ctx.gl.pixelStorei(ctx.gl.UNPACK_ALIGNMENT, 1);

	load_from_url("img/room.jpg");

	/* DEBUG */
	ctx.gui.menu();
}

function animate() {
	requestAnimationFrame(animate);
	resizeCanvasToDisplaySize();

	render();

	ctx.stats.update();
}

function render() {
	if (!ctx.gui.crop && !ctx.gui.project)
		ctx.gl.clear(ctx.gl.COLOR_BUFFER_BIT);
	ctx.gl.viewport(0, 0, ctx.canvas.width, ctx.canvas.height);

	update_camera();
	if (ctx.gui.crop)
		render_crop();
	if (ctx.gui.project)
		render_project();
	if (ctx.gui.viz)
		render_border();
}

async function load_from_url(url) {
	ctx.dom.spinner.style.display = 'block';
	try {
		ctx.dom.statusMSG.innerText = "Requesting " + url;
		const response = await fetch(url);
		ctx.dom.statusMSG.innerText = "Downloading " + url;
		ctx.dom.filesize.innerText = "(" +
			((response.headers.get('Content-Length') / 1000000)).toFixed(2) +
			" MegaByte" + ")";
		const blob = await response.blob();
		ctx.dom.statusMSG.innerText = "Decoding image";
		const bitmap = await createImageBitmap(blob);

		const crop = {
			top: 46,
			bot: 62,
			left: 45,
			right: 63
		}

		media_setup(bitmap, crop);

	} catch (err) {
		console.error(err);
	}
}

function media_setup(bitmap, crop) {
	ctx.dom.statusMSG.innerText = "Transfering into GPU memory";
	ctx.gui.controller.left.max(bitmap.width / 2).setValue(crop.left);
	ctx.gui.controller.right.max(bitmap.width / 2).setValue(crop.right);
	ctx.gui.controller.top.max(bitmap.height / 2).setValue(crop.top);
	ctx.gui.controller.bot.max(bitmap.height / 2).setValue(crop.bot);

	ctx.gl.deleteTexture(ctx.ch1.tex);
	ctx.ch1.tex = ctx.gl.createTexture();
	ctx.gl.bindTexture(ctx.gl.TEXTURE_2D, ctx.ch1.tex);
	ctx.gl.texParameteri(ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_WRAP_S, ctx.gl.CLAMP_TO_EDGE);
	ctx.gl.texParameteri(ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_WRAP_T, ctx.gl.CLAMP_TO_EDGE);
	ctx.gl.texParameteri(ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_MIN_FILTER, ctx.gl.LINEAR);
	ctx.gl.texParameteri(ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_MAG_FILTER, ctx.gl.LINEAR);

	ctx.ch1.w = bitmap.width;
	ctx.ch1.h = bitmap.height;
	ctx.gl.texImage2D(ctx.gl.TEXTURE_2D, 0, ctx.gl.RGBA, ctx.gl.RGBA, ctx.gl.UNSIGNED_BYTE,
		bitmap);
	bitmap.close();
	ctx.dom.spinner.style.display = 'none';
	ctx.dom.statusMSG.innerText = "\u00A0";
	ctx.dom.filesize.innerText = "\u00A0";
}

main();

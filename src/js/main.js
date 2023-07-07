import { ctx, redraw } from './state.js';
import init_gui from './gui.js';
import { resizeCanvasToDisplaySize, onResize } from './resize.js'
import init_shaders from './init_shaders.js'
import render from './render.js'
import { key_input, setup_input } from './input.js'

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
}

function init() {
	ctx.canvasToDisplaySizeMap = new Map([[ctx.canvas, [300, 150]]]);
	const resizeObserver = new ResizeObserver(onResize);
	resizeObserver.observe(ctx.canvas, { box: 'content-box' });

	/* Input handlers */

	init_gui();
	init_shaders(ctx, ctx.gl);
	/* Add the stats */
	document.body.appendChild(ctx.stats.dom);
	document.body.appendChild(ctx.stats_events.dom);
	ctx.stats_events.dom.style.position = 'absolute';
	ctx.stats_events.dom.style.left = ctx.stats_events.dom.offsetWidth + 'px';
	/* ctx.stats.dom.style.display = ctx.gui.showStats ? 'block' : 'none';
	ctx.stats_events.dom.style.display =
		ctx.gui.showEventStats ? 'block' : 'none'; */

	ctx.gl.clearColor(0, 0, 0, 1);
	/* Prevents headaches when loading NPOT textures */
	ctx.gl.pixelStorei(ctx.gl.UNPACK_ALIGNMENT, 1);

	load_from_url("img/room.jpg");

	/* DEBUG */
	ctx.gui.menu();

	setup_input();
}

/* Loop for animation only needs to happen event based. Aka photo mode with
   mouse or touch */
ctx.animate = function animate(time) {
	/* Will always redraw in WebCam or Video mode, but not in photo mode */
	if (!ctx.redraw || ctx.continous) {
		/* Stats for rejected events */
		ctx.stats_events.update();
		return;
	}
	ctx.redraw = false;

	/* Keys have to be polled for smooth operation */
	if (ctx.continous) {
		key_input(time);
	}

	render();
	requestAnimationFrame(animate);
}

/* Loop for constant rendering, like when video or webcams are viewer. Also
   needed for smooth keyboard usage */
ctx.animate_cont = function animate(time) {
	/* Keys have to be polled for smooth operation */
	key_input(time);

	render();
	if (ctx.continous)
		requestAnimationFrame(animate);
}

async function load_from_url(url) {
	ctx.dom.spinner.style.display = 'block';
	ctx.gui.handle.hide();
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
		ctx.ch1.fov_deg = 342;
		ctx.gui.controller.img_fov.updateDisplay();

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
	ctx.gl.texParameteri(
		ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_WRAP_S, ctx.gl.CLAMP_TO_EDGE);
	ctx.gl.texParameteri(
		ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_WRAP_T, ctx.gl.CLAMP_TO_EDGE);
	ctx.gl.texParameteri(
		ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_MIN_FILTER, ctx.gl.LINEAR);
	ctx.gl.texParameteri(
		ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_MAG_FILTER, ctx.gl.LINEAR);

	ctx.ch1.w = bitmap.width;
	ctx.ch1.h = bitmap.height;
	ctx.gl.texImage2D(ctx.gl.TEXTURE_2D, 0, ctx.gl.RGBA, ctx.gl.RGBA,
		ctx.gl.UNSIGNED_BYTE, bitmap);
	bitmap.close();
	ctx.gui.handle.show();
	ctx.dom.spinner.style.display = 'none';
	ctx.dom.statusMSG.innerText = "\u00A0";
	ctx.dom.filesize.innerText = "\u00A0";

	/* Have to call a redraw here, since this function is called async */
	ctx.redraw = true;
	redraw();
}

main();
import ctx from './state.js';
import { init_gui } from './gui.js';
import { resizeCanvasToDisplaySize, onResize } from './resize.js'
import { init_shaders } from './init_shaders.js'
import { render_crop } from './render_crop.js'

const canvas = document.querySelector("canvas");
const gl = canvas.getContext("webgl");

function main() {
	if (gl)
		console.log(
			"WebGL Version: " + gl.getParameter(gl.VERSION) + '\n' +
			"Vendor: " + gl.getParameter(gl.VENDOR) + '\n' +
			"Renderer: " + gl.getParameter(gl.RENDERER) + '\n' +
			"GLSL Version: " + gl.getParameter(gl.SHADING_LANGUAGE_VERSION)
			+ '\n' +
			"Max tex-size: " + gl.getParameter(gl.MAX_TEXTURE_SIZE) + "px²");
	else {
		console.error("No WebGl context received.");
		return;
	}

	init();
	requestAnimationFrame(animate);
}

function init() {
	ctx.canvasToDisplaySizeMap = new Map([[canvas, [300, 150]]]);
	const resizeObserver = new ResizeObserver(onResize);
	resizeObserver.observe(canvas, { box: 'content-box' });

	init_gui();
	init_shaders(ctx, gl);
	/* Add the stats */
	document.body.appendChild(ctx.stats.dom);

	gl.clearColor(0, 0, 0, 1);
	/* Prevents headaches when loading NPOT textures */
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

	load_from_url("img/room.jpg");
}

function animate() {
	requestAnimationFrame(animate);
	resizeCanvasToDisplaySize(canvas, ctx.canvasToDisplaySizeMap);

	render();

	ctx.stats.update();
}

function render() {
	gl.clear(gl.COLOR_BUFFER_BIT);
	gl.viewport(0, 0, canvas.width, canvas.height);

	if (ctx.gui.crop)
		render_crop(ctx, gl, canvas.width, canvas.height);
}

async function load_from_url(url) {
	try {
		const response = await fetch(url);
		const blob = await response.blob();
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
	ctx.gui.controller.left.max(bitmap.width / 2).setValue(crop.left);
	ctx.gui.controller.right.max(bitmap.width / 2).setValue(crop.right);
	ctx.gui.controller.top.max(bitmap.height / 2).setValue(crop.top);
	ctx.gui.controller.bot.max(bitmap.height / 2).setValue(crop.bot);

	gl.deleteTexture(ctx.ch1.tex);
	ctx.ch1.tex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, ctx.ch1.tex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

	ctx.ch1.w = bitmap.width;
	ctx.ch1.h = bitmap.height;
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		bitmap);
	bitmap.close();
}

main();

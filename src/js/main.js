import { ctr, ctx } from './state.js';
import { load_from_url, update_texture } from './media.js';
import media from './mediaData.js';
import { print_glinfo } from './gl_basics.js'
import init_gui from './gui.js';
import { onResize } from './resize_canvas.js'
import init_shaders from './init_shaders.js'
import render from './render.js'
import { setupTabs } from './tabs.js';
import { key_input, setup_input, controller_input } from './input.js'

ctx.canvas = document.querySelector("canvas");
/* Since we draw over the whole screen, no need to flush */
ctx.gl = ctx.canvas.getContext('webgl', { preserveDrawingBuffer: false });
ctx.canvas.addEventListener('webglcontextlost', handleContextLost, false);

function handleContextLost(event) {
	ctx.dom.message.style.display = 'flex';
}

function main() {
	if (ctx.gl)
		print_glinfo();
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

	ctx.max_texsize = ctx.gl.getParameter(ctx.gl.MAX_TEXTURE_SIZE);
	/* Input handlers */

	init_gui();
	init_shaders(ctx, ctr, ctx.gl);
	/* Add the stats */
	document.body.appendChild(ctx.stats.dom);
	document.body.appendChild(ctx.stats_events.dom);
	ctx.stats_events.dom.style.position = 'absolute';
	ctx.stats_events.dom.style.left = ctx.stats_events.dom.offsetWidth + 'px';
	ctx.stats.dom.style.display = ctx.gui.showStats ? 'block' : 'none';
	ctx.stats_events.dom.style.display =
		ctx.gui.showEventStats ? 'block' : 'none';

	/* Alpha for multi-source video feeds */
	ctx.gl.enable(ctx.gl.BLEND);
	ctx.gl.blendFunc(ctx.gl.SRC_ALPHA, ctx.gl.ONE_MINUS_SRC_ALPHA);

	ctx.gl.clearColor(0, 0, 0, 1);
	/* Prevents headaches when loading NPOT textures */
	ctx.gl.pixelStorei(ctx.gl.UNPACK_ALIGNMENT, 1);

	setupTabs();
	load_from_url(media[0]);

	setup_input();
}

/* Loop for animation only needs to happen event based. Aka photo mode with
   mouse or touch */
ctx.animate = function animate() {
	/* Will always redraw in WebCam or Video mode, but not in photo mode */
	if (!ctx.redraw || ctx.continous) {
		/* Stats for rejected events */
		ctx.stats_events.update();
		return;
	}
	ctx.redraw = false;

	render();
	requestAnimationFrame(animate);
}

/* Loop for constant rendering, like when video or webcams are viewer. Also
   needed for smooth keyboard usage */
ctx.animate_cont = function animate(time) {
	/* Keys have to be polled for smooth operation */
	key_input(time);

	if (ctx.gui.eruda) var bit3_time = performance.now()
	if (ctx.playing)
		createImageBitmap(ctx.video).then(bitmap => {
			if (ctx.gui.eruda)
				console.log("Bitmap update [ms]:",
					(performance.now() - bit3_time).toFixed(2));
			update_texture(bitmap);
		});

	if (ctx.controller) {
		controller_input(time);
	}

	render();
	if (ctx.continous || ctx.playing || ctx.controller)
		requestAnimationFrame(animate);
}

main();
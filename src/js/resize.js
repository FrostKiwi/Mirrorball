/* Proper resize handling for native resolution canvases, provided by the
   brilliant blog post:
   https://webglfundamentals.org/webgl/lessons/webgl-resizing-the-canvas.html */
import ctx from './state.js';

export function onResize(entries) {
	for (const entry of entries) {
		let width;
		let height;
		let dpr = window.devicePixelRatio;
		if (entry.devicePixelContentBoxSize) {
			// NOTE: Only this path gives the correct answer
			// The other 2 paths are an imperfect fallback
			// for browsers that don't provide anyway to do this
			width = entry.devicePixelContentBoxSize[0].inlineSize;
			height = entry.devicePixelContentBoxSize[0].blockSize;
			dpr = 1; // it's already in width and height
		} else if (entry.contentBoxSize) {
			if (entry.contentBoxSize[0]) {
				width = entry.contentBoxSize[0].inlineSize;
				height = entry.contentBoxSize[0].blockSize;
			} else {
				// legacy
				width = entry.contentBoxSize.inlineSize;
				height = entry.contentBoxSize.blockSize;
			}
		} else {
			// legacy
			width = entry.contentRect.width;
			height = entry.contentRect.height;
		}

		const displayWidth = Math.round(width * dpr);
		const displayHeight = Math.round(height * dpr);
		ctx.canvasToDisplaySizeMap.set(entry.target,
			[displayWidth, displayHeight]);
	}
}

export function resizeCanvasToDisplaySize() {
	// Get the size the browser is displaying the canvas in device pixels.
	const [displayWidth, displayHeight] =
		ctx.canvasToDisplaySizeMap.get(ctx.canvas);

	// Check if the canvas is not the same size.
	const needResize = ctx.canvas.width !== displayWidth ||
		ctx.canvas.height !== displayHeight;

	if (needResize) {
		// Make the canvas the same size
		ctx.canvas.width = displayWidth;
		ctx.canvas.height = displayHeight;
	}
	return needResize;
}
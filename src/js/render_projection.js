import ctx from './state.js';

export default function render_project() {
	const crop = {
		x: (1 / ctx.ch1.w) *
			(ctx.ch1.w / 2 + ctx.ch1.crop.left / 2 - ctx.ch1.crop.right / 2),
		y: (1 / ctx.ch1.h) *
			(ctx.ch1.h / 2 + ctx.ch1.crop.top / 2 - ctx.ch1.crop.bot / 2),
		w: (1 / ctx.ch1.w) *
			(ctx.ch1.w - ctx.ch1.crop.left / 1 - ctx.ch1.crop.right / 1),
		h: (1 / ctx.ch1.h) *
			(ctx.ch1.h - ctx.ch1.crop.top / 1 - ctx.ch1.crop.bot / 1)
	}

	ctx.gl.useProgram(ctx.shaders.project.handle);
	ctx.gl.uniform4f(ctx.shaders.project.crop, crop.x, crop.y, crop.w, crop.h);

	ctx.gl.enableVertexAttribArray(ctx.shaders.project.pos);
	ctx.gl.enableVertexAttribArray(ctx.shaders.project.viewray);

	ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, ctx.shaders.project.rayvbo);
	ctx.gl.bufferData(ctx.gl.ARRAY_BUFFER, ctx.cam.viewrays, ctx.gl.DYNAMIC_DRAW);

	ctx.gl.vertexAttribPointer(
		ctx.shaders.project.pos, 2, ctx.gl.FLOAT, false,
		5 * Float32Array.BYTES_PER_ELEMENT, 0
	);
	ctx.gl.vertexAttribPointer(
		ctx.shaders.project.viewray, 3, ctx.gl.FLOAT, false,
		5 * Float32Array.BYTES_PER_ELEMENT,
		2 * Float32Array.BYTES_PER_ELEMENT
	);
	ctx.gl.uniform1f(ctx.shaders.project.scaler, 1.0);

	ctx.gl.drawArrays(ctx.gl.TRIANGLE_FAN, 0, 4);
}
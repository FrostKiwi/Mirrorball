import { ctx, ctr } from './state.js';
import * as glm from 'gl-matrix';

export default function render_latlong(width, height, channel) {
	const crop = {
		x: (1 / ctx.shaders.ch1.w) *
			(ctx.shaders.ch1.w / 2 + channel.crop.left /
				2 - channel.crop.right / 2),
		y: (1 / ctx.shaders.ch1.h) *
			(ctx.shaders.ch1.h / 2 + channel.crop.top /
				2 - channel.crop.bot / 2),
		w: (1 / ctx.shaders.ch1.w) *
			(ctx.shaders.ch1.w - channel.crop.left /
				1 - channel.crop.right / 1),
		h: (1 / ctx.shaders.ch1.h) *
			(ctx.shaders.ch1.h - channel.crop.top /
				1 - channel.crop.bot / 1)
	}

	ctx.gl.useProgram(ctx.shaders.latlong.handle);

	/* Split-screen rendering */
	if (width < ctx.canvas.width)
		ctx.gl.uniform4f(ctx.shaders.latlong.split, 0.5, 0, 0.5, 1);
	else if (height < ctx.canvas.height)
		ctx.gl.uniform4f(ctx.shaders.latlong.split, 0, -0.5, 1, 0.5);
	else
		ctx.gl.uniform4f(ctx.shaders.latlong.split, 0, 0, 1, 1);

	ctx.gl.uniform4f(ctx.shaders.latlong.crop, crop.x, crop.y, crop.w, crop.h);

	ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, ctx.shaders.latlong.bgvbo);
	ctx.gl.enableVertexAttribArray(ctx.shaders.latlong.vtx);
	ctx.gl.enableVertexAttribArray(ctx.shaders.latlong.coord);
	ctx.gl.vertexAttribPointer(ctx.shaders.latlong.vtx, 2, ctx.gl.FLOAT, false,
		4 * Float32Array.BYTES_PER_ELEMENT, 0);
	ctx.gl.vertexAttribPointer(ctx.shaders.latlong.coord, 2, ctx.gl.FLOAT, false,
		4 * Float32Array.BYTES_PER_ELEMENT,
		2 * Float32Array.BYTES_PER_ELEMENT);

	/* As per formula */
	const scalar = 1.0 / Math.sin(glm.glMatrix.toRadian(channel.fov_deg) / 4.0);
	ctx.gl.uniform1f(ctx.shaders.latlong.scaler, scalar);

	ctx.gl.drawArrays(ctx.gl.TRIANGLE_FAN, 0, 4);
}
import { ctx, ctr } from './state.js';
import * as glm from 'gl-matrix';

export default function render_project(width, height, channel) {
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

	if (ctr.tog.antialias)
		ctx.gl.useProgram(ctx.shaders.project.handle_AA);
	else
		ctx.gl.useProgram(ctx.shaders.project.handle);

	/* Split-screen rendering */
	if (width < ctx.canvas.width)
		ctx.gl.uniform4f(ctx.shaders.project.split, 0.5, 0, 0.5, 1);
	else if (height < ctx.canvas.height)
		ctx.gl.uniform4f(ctx.shaders.project.split, 0, -0.5, 1, 0.5);
	else
		ctx.gl.uniform4f(ctx.shaders.project.split, 0, 0, 1, 1);

	ctx.gl.uniform4f(ctx.shaders.project.crop, crop.x, crop.y, crop.w, crop.h);

	ctx.gl.enableVertexAttribArray(ctx.shaders.project.pos);
	ctx.gl.enableVertexAttribArray(ctx.shaders.project.viewray);

	ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, ctx.shaders.project.rayvbo);
	ctx.gl.bufferData(ctx.gl.ARRAY_BUFFER, ctx.shaders.viewrays,
		ctx.gl.DYNAMIC_DRAW);

	ctx.gl.vertexAttribPointer(
		ctx.shaders.project.pos, 2, ctx.gl.FLOAT, false,
		5 * Float32Array.BYTES_PER_ELEMENT, 0
	);
	ctx.gl.vertexAttribPointer(
		ctx.shaders.project.viewray, 3, ctx.gl.FLOAT, false,
		5 * Float32Array.BYTES_PER_ELEMENT,
		2 * Float32Array.BYTES_PER_ELEMENT
	);

	/* As per formula */
	const scalar = 1.0 / Math.sin(glm.glMatrix.toRadian(channel.fov_deg) / 4.0);
	ctx.gl.uniform1f(ctx.shaders.project.scaler, scalar);
	ctx.gl.uniform1f(ctx.shaders.project.area_toggle, ctr.tog.area);
	ctx.gl.uniform1f(ctx.shaders.project.area_f,
		Math.sin(glm.glMatrix.toRadian(ctr.tog.area_f) / 4.0) / 2.0);
	ctx.gl.uniform1f(ctx.shaders.project.area_b,
		Math.sin(glm.glMatrix.toRadian(360 - ctr.tog.area_b) / 4.0) / 2.0);

	if (channel.alpha)
		ctx.gl.uniform1f(ctx.shaders.project.alpha, channel.alpha);
	else
		ctx.gl.uniform1f(ctx.shaders.project.alpha, 1);

	ctx.gl.drawArrays(ctx.gl.TRIANGLE_FAN, 0, 4);
}
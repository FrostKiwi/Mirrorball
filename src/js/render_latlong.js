import { ctx } from './state.js';
import * as glm from 'gl-matrix';

export default function render_latlong(channel) {
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

	/* Rotation */
	const ch1_rot_x = glm.glMatrix.toRadian(channel.rot_deg[0]);
	const ch1_rot_y = glm.glMatrix.toRadian(channel.rot_deg[1]);
	const ch1_rot_z = glm.glMatrix.toRadian(channel.rot_deg[2]);

	/* Mat3 rotations not supported, using Mat4 instead */
	const tempMat = glm.mat4.create();
	glm.mat4.rotateX(tempMat, tempMat, ch1_rot_x);
	glm.mat4.rotateY(tempMat, tempMat, ch1_rot_y);
	glm.mat4.rotateZ(tempMat, tempMat, ch1_rot_z);
	
	const rotMat = glm.mat3.create();
	glm.mat3.fromMat4(rotMat, tempMat)
	ctx.gl.uniformMatrix3fv(ctx.shaders.latlong.rotMat, false, rotMat);

	if (channel.alpha)
		ctx.gl.uniform1f(ctx.shaders.latlong.alpha, channel.alpha);
	else
		ctx.gl.uniform1f(ctx.shaders.latlong.alpha, 1);

	ctx.gl.drawArrays(ctx.gl.TRIANGLE_FAN, 0, 4);
	ctx.gl.flush();
}
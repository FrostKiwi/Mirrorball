import * as glm from 'gl-matrix';
import ctx from './state.js';

function eulerZYX(x, y, z) {
	const dest = glm.mat3.create();

	const sx = Math.sin(x);
	const cx = Math.cos(x);
	const sy = Math.sin(y);
	const cy = Math.cos(y);
	const sz = Math.sin(z);
	const cz = Math.cos(z);

	const czsx = cz * sx;
	const cxcz = cx * cz;
	const sysz = sy * sz;

	dest[0] = cy * cz;
	dest[1] = cy * sz;
	dest[2] = -sy;
	dest[3] = czsx * sy - cx * sz;
	dest[4] = cxcz + sx * sysz;
	dest[5] = cy * sx;
	dest[6] = cxcz * sy + sx * sz;
	dest[7] = -czsx + cx * sysz;
	dest[8] = cx * cy;

	return dest;
}

export default function update_camera() {
	let rot_matrix = glm.mat3.create();

	const cam_rot_matrix = eulerZYX(
		glm.glMatrix.toRadian(ctx.cam.rot_deg[0]),
		glm.glMatrix.toRadian(ctx.cam.rot_deg[1] + 180),
		glm.glMatrix.toRadian(ctx.cam.rot_deg[2])
	);
	const world_rot_matrix = eulerZYX(
		glm.glMatrix.toRadian(ctx.ch1.rot_deg[0]),
		glm.glMatrix.toRadian(ctx.ch1.rot_deg[1]),
		glm.glMatrix.toRadian(ctx.ch1.rot_deg[2])
	);
	glm.mat3.mul(rot_matrix, rot_matrix, world_rot_matrix);
	glm.mat3.mul(rot_matrix, rot_matrix, cam_rot_matrix);

	/* Precalc some stuff */
	const distance = -0.5 / Math.tan(ctx.cam.fov.cur / 2.0);
	const half_aspect = 0.5 * ctx.canvas.width / ctx.canvas.height;

	/* Update View-Rays */
	for (let i = 0; i < 4 * 5; i += 5) {
		let vec = glm.vec3.fromValues(
			ctx.cam.viewrays[i] * half_aspect,
			ctx.cam.viewrays[i + 1] * 0.5,
			distance
		);

		glm.vec3.transformMat3(vec, vec, rot_matrix);
		ctx.cam.viewrays[i + 2] = vec[0];
		ctx.cam.viewrays[i + 3] = vec[1];
		ctx.cam.viewrays[i + 4] = vec[2];
	}
}
import * as glm from 'gl-matrix';
import ctx from './state.js';

import { eulerZYX, MulRot, glmVec3RotateM4 } from './custom_vector_funcs.js'

export default function update_camera() {
	const basis = glm.mat4.create();
	let view = glm.mat4.create();

	let cam_rot_matrix = eulerZYX(ctx.cam.rot);
	const world_rot_matrix = eulerZYX(ctx.ch1.rot);
	glm.mat4.mul(basis, basis, world_rot_matrix);/* Useless? */
	glm.mat4.mul(basis, basis, cam_rot_matrix);

	glm.mat4.copy(cam_rot_matrix, basis);
	view = MulRot(view, cam_rot_matrix); /* Just Copy basis? */
	glm.mat4.invert(view, view);

	const rof = glm.mat4.create();
	glm.mat4.perspectiveNO(
		rof, ctx.cam.fov.cur, ctx.canvas.width / ctx.canvas.height, 0.01, 0
	);

	// Update View-Rays
	let distance = -0.5 / Math.tan(ctx.cam.fov.cur / 2.0);
	for (let i = 0; i < 4 * 5; i += 5) {
		ctx.cam.viewrays[i + 4] = distance;
		ctx.cam.viewrays[i + 2] =
			ctx.cam.viewrays[i] * 0.5 * ctx.canvas.width / ctx.canvas.height;
		ctx.cam.viewrays[i + 3] = ctx.cam.viewrays[i + 1] * 0.5;

		let vec = glm.vec3.fromValues(
			ctx.cam.viewrays[i + 2],
			ctx.cam.viewrays[i + 3],
			ctx.cam.viewrays[i + 4]
		);

		// use the glmVec3RotateM4 function
		let result = glmVec3RotateM4(cam_rot_matrix, vec);
		ctx.cam.viewrays[i + 2] = result[0];
		ctx.cam.viewrays[i + 3] = result[1];
		ctx.cam.viewrays[i + 4] = result[2];
	}
}
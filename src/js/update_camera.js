import * as glm from 'gl-matrix';
import ctx from './state.js';

import {
	eulerZYX, MulRot, Vec3RotateM4
} from './custom_vector_funcs.js'

export default function update_camera() {
	let basis = glm.mat4.create();

	const cam_rot = glm.vec3.fromValues(
		glm.glMatrix.toRadian(ctx.cam.rot_deg[0]),
		glm.glMatrix.toRadian(ctx.cam.rot_deg[1] + 180),
		glm.glMatrix.toRadian(ctx.cam.rot_deg[2])
	);
	const ch1_rot = glm.vec3.fromValues(
		glm.glMatrix.toRadian(ctx.ch1.rot_deg[0]),
		glm.glMatrix.toRadian(ctx.ch1.rot_deg[1]),
		glm.glMatrix.toRadian(ctx.ch1.rot_deg[2])
	);
	const cam_rot_matrix = eulerZYX(cam_rot);
	const world_rot_matrix = eulerZYX(ch1_rot);
	basis = MulRot(basis, world_rot_matrix);
	basis = MulRot(basis, cam_rot_matrix);

	/* Update View-Rays */
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

		let result = Vec3RotateM4(basis, vec);
		ctx.cam.viewrays[i + 2] = result[0];
		ctx.cam.viewrays[i + 3] = result[1];
		ctx.cam.viewrays[i + 4] = result[2];
	}
}
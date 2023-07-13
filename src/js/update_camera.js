import * as glm from 'gl-matrix';
import { ctx, ctr } from './state.js';

export default function update_camera(width, height) {
	/* Precalc some stuff */
	const distance =
		-0.5 / Math.tan(glm.glMatrix.toRadian(ctr.cam.fov.cur) / 2);
	const half_aspect = 0.5 * width / height;
	const zero = glm.vec3.fromValues(0, 0, 0);

	/* Camera rotation */
	const cam_rot_x = glm.glMatrix.toRadian(ctr.cam.rot_deg[0]);
	/* Flip 180 degrees to show the camera at zero rotation in respect to the
	   mirror image. */
	const cam_rot_y = glm.glMatrix.toRadian(ctr.cam.rot_deg[1] + 180);

	/* Channel 1 rotation */
	const ch1_rot_x = glm.glMatrix.toRadian(ctr.ch1.rot_deg[0]);
	const ch1_rot_y = glm.glMatrix.toRadian(ctr.ch1.rot_deg[1]);
	const ch1_rot_z = glm.glMatrix.toRadian(ctr.ch1.rot_deg[2]);

	/* Update View-Rays */
	for (let i = 0; i < 4 * 5; i += 5) {
		let vec = glm.vec3.fromValues(
			ctx.shaders.viewrays[i] * half_aspect,
			ctx.shaders.viewrays[i + 1] * 0.5,
			distance
		);

		/* Camera rotation */
		glm.vec3.rotateX(vec, vec, zero, cam_rot_x);
		glm.vec3.rotateY(vec, vec, zero, cam_rot_y);
		/* User doesn't get to control roll */

		/* World rotation */
		glm.vec3.rotateX(vec, vec, zero, ch1_rot_x);
		glm.vec3.rotateY(vec, vec, zero, ch1_rot_y);
		glm.vec3.rotateZ(vec, vec, zero, ch1_rot_z);

		/* Assign to the buffer */
		ctx.shaders.viewrays[i + 2] = vec[0];
		ctx.shaders.viewrays[i + 3] = vec[1];
		ctx.shaders.viewrays[i + 4] = vec[2];
	}
}
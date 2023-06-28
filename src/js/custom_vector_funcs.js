import * as glm from 'gl-matrix';

export function eulerZYX(angles) {
	let dest = glm.mat4.create();
	let cx, cy, cz, sx, sy, sz, czsx, cxcz, sysz;

	sx = Math.sin(angles[0]);
	cx = Math.cos(angles[0]);
	sy = Math.sin(angles[1]);
	cy = Math.cos(angles[1]);
	sz = Math.sin(angles[2]);
	cz = Math.cos(angles[2]);

	czsx = cz * sx;
	cxcz = cx * cz;
	sysz = sy * sz;

	dest[0] = cy * cz;
	dest[1] = cy * sz;
	dest[2] = -sy;
	dest[4] = czsx * sy - cx * sz;
	dest[5] = cxcz + sx * sysz;
	dest[6] = cy * sx;
	dest[8] = cxcz * sy + sx * sz;
	dest[9] = -czsx + cx * sysz;
	dest[10] = cx * cy;
	dest[3] = 0.0;
	dest[7] = 0.0;
	dest[11] = 0.0;
	dest[12] = 0.0;
	dest[13] = 0.0;
	dest[14] = 0.0;
	dest[15] = 1.0;

	return dest;
}

export function MulRot(m1, m2) {
	let dest = glm.mat4.create();

	let a00 = m1[0], a01 = m1[1], a02 = m1[2], a03 = m1[3],
		a10 = m1[4], a11 = m1[5], a12 = m1[6], a13 = m1[7],
		a20 = m1[8], a21 = m1[9], a22 = m1[10], a23 = m1[11],
		a30 = m1[12], a31 = m1[13], a32 = m1[14], a33 = m1[15],

		b00 = m2[0], b01 = m2[1], b02 = m2[2],
		b10 = m2[4], b11 = m2[5], b12 = m2[6],
		b20 = m2[8], b21 = m2[9], b22 = m2[10];

	dest[0] = a00 * b00 + a10 * b01 + a20 * b02;
	dest[1] = a01 * b00 + a11 * b01 + a21 * b02;
	dest[2] = a02 * b00 + a12 * b01 + a22 * b02;
	dest[3] = a03 * b00 + a13 * b01 + a23 * b02;

	dest[4] = a00 * b10 + a10 * b11 + a20 * b12;
	dest[5] = a01 * b10 + a11 * b11 + a21 * b12;
	dest[6] = a02 * b10 + a12 * b11 + a22 * b12;
	dest[7] = a03 * b10 + a13 * b11 + a23 * b12;

	dest[8] = a00 * b20 + a10 * b21 + a20 * b22;
	dest[9] = a01 * b20 + a11 * b21 + a21 * b22;
	dest[10] = a02 * b20 + a12 * b21 + a22 * b22;
	dest[11] = a03 * b20 + a13 * b21 + a23 * b22;

	dest[12] = a30;
	dest[13] = a31;
	dest[14] = a32;
	dest[15] = a33;

	return dest;
}

function glm_mat4_pick3t(mat) {
	let dest = glm.mat3.create();

	dest[0] = mat[0];
	dest[1] = mat[4];
	dest[2] = mat[8];

	dest[3] = mat[1];
	dest[4] = mat[5];
	dest[5] = mat[9];

	dest[6] = mat[2];
	dest[7] = mat[6];
	dest[8] = mat[10];

	return dest;
}

export function glm_inv_tr(mat) {
	let r = glm.mat3.create();
	let t = glm.vec3.create();

	/* rotate */
	glm_mat4_pick3t(mat, r);
	glm_mat4_ins3(r, mat);

	/* translate */
	glm_mat3_mulv(r, mat[3], t);
	glm_vec3_negate(t);
	glm_vec3_copy(t, mat[3]);
}

export function printMat4(matrix) {
	let result = '';
	for (let col = 0; col < 4; col++) {
		for (let row = 0; row < 4; row++) {
			result += matrix[row + col * 4].toFixed(3) + ' ';
		}
		result += '\n';
	}
	console.log(result);
}

export function glmVec3RotateM4(m, v) {
	let x = glm.vec4.create();
	let y = glm.vec4.create();
	let z = glm.vec4.create();
	let res = glm.vec4.create();

	// Normalize rows of matrix m
	glm.vec4.normalize(x, m.subarray(0, 4));
	glm.vec4.normalize(y, m.subarray(4, 8));
	glm.vec4.normalize(z, m.subarray(8, 12));

	// Scale x by v[0] and store in res
	glm.vec4.scale(res, x, v[0]);
	// Scale y by v[1] and add to res
	glm.vec4.scaleAndAdd(res, res, y, v[1]);
	// Scale z by v[2] and add to res
	glm.vec4.scaleAndAdd(res, res, z, v[2]);

	// Return the first three components of res as a vec3
	return glm.vec3.fromValues(res[0], res[1], res[2]);
}

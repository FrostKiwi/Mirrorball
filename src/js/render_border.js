import { ctx, ctr } from './state.js';
import * as glm from 'gl-matrix';

const POINT_SIZE = 0.022;
const COLOR_TOPLEFT = glm.vec3.fromValues(1, 0, 1);
const COLOR_TOPRIGHT = glm.vec3.fromValues(1, 1, 0);
const COLOR_BOTLEFT = glm.vec3.fromValues(0, 1, 1);
const COLOR_BOTRIGHT = glm.vec3.fromValues(1, 1, 0);

function interp_border_pts(a, b, subdiv, aspect_ratio, color_a, color_b, diag,
	channel) {
	subdiv = Math.trunc(subdiv);

	/* Ensure there is a point in the middle by making subdiv odd */
	if (subdiv % 2 == 1)
		subdiv++;
	const ray = glm.vec3.create();
	const uv_proj = glm.vec2.create();
	const col = glm.vec3.create();
	const white = glm.vec3.fromValues(1, 1, 1);

	for (let x = 0; x < subdiv; ++x) {
		let mult = (1.0 / subdiv) * x;
		glm.vec3.lerp(ray, a, b, mult);
		glm.vec3.lerp(col, color_a, color_b, mult);
		/* Instead of barycentric coordinates for the color, just blend with
		   white in the diagonal case */
		if (diag)
			glm.vec3.lerp(col, white, col, 2 * Math.abs(0.5 - mult));
		glm.vec3.normalize(ray, ray);

		const divider = 2.0 * Math.SQRT2 * Math.sqrt(ray[2] + 1.0);
		const scalar = 1 / Math.sin(glm.glMatrix.toRadian(channel.fov_deg) / 4);

		glm.vec2.scale(
			uv_proj,
			glm.vec2.fromValues(ray[0], ray[1]),
			scalar
		);
		glm.vec2.scale(uv_proj, uv_proj, 1 / divider);
		glm.vec2.scale(uv_proj, uv_proj, 2);
		glm.vec2.mul(uv_proj, uv_proj, aspect_ratio);

		ctx.gl.uniform2f(ctx.shaders.border.transform, uv_proj[0], uv_proj[1]);
		ctx.gl.uniform3f(ctx.shaders.border.color, col[0], col[1], col[2]);
		/* Draw small quad */
		ctx.gl.drawArrays(ctx.gl.TRIANGLE_FAN, 0, 4);
	}
}

/* Simple border for the projection view */
function interp_border_pts_smp(a, b, subdiv, color_a, color_b, diag) {
	subdiv = Math.trunc(subdiv);

	/* Ensure there is a point in the middle by making subdiv odd */
	if (subdiv % 2 == 1)
		subdiv++;
	const uv_proj = glm.vec2.create();
	const col = glm.vec3.create();
	const white = glm.vec3.fromValues(1, 1, 1);

	for (let x = 0; x < subdiv; ++x) {
		let mult = (1.0 / subdiv) * x;
		glm.vec3.lerp(col, color_a, color_b, mult);
		/* Instead of barycentric coordinates for the color, just blend with
		   white in the diagonal case */
		if (diag)
			glm.vec3.lerp(col, white, col, 2 * Math.abs(0.5 - mult));

		glm.vec2.lerp(uv_proj, a, b, mult);

		ctx.gl.uniform2f(ctx.shaders.border.transform, uv_proj[0], uv_proj[1]);
		ctx.gl.uniform3f(ctx.shaders.border.color, col[0], col[1], col[2]);
		/* Draw small quad */
		ctx.gl.drawArrays(ctx.gl.TRIANGLE_FAN, 0, 4);
	}
}

export default function render_border(project_points, subdiv, width, height,
	channel) {
	const aspect = width / height;

	ctx.gl.useProgram(ctx.shaders.border.handle);

	ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, ctx.shaders.border.quadvbo);
	ctx.gl.enableVertexAttribArray(ctx.shaders.border.vtx);

	const postcrop_w =
		ctx.shaders.ch1.w - (channel.crop.left + channel.crop.right);
	const postcrop_h =
		ctx.shaders.ch1.h - (channel.crop.top + channel.crop.bot);

	const aspect_ratio = glm.vec2.fromValues(1, 1);

	if (postcrop_h / postcrop_w > height / width)
		aspect_ratio[0] =
			(postcrop_w / postcrop_h) / (width / height);
	else
		aspect_ratio[1] =
			(postcrop_h / postcrop_w) / (height / width);

	ctx.gl.vertexAttribPointer(ctx.shaders.border.vtx, 2, ctx.gl.FLOAT, false,
		2 * Float32Array.BYTES_PER_ELEMENT, 0);
	ctx.gl.uniform2f(ctx.shaders.border.scale,
		POINT_SIZE / aspect, POINT_SIZE);
	/* Calculate pixel size ( and reciprocal to remove a shader division ) */
	ctx.gl.uniform1f(ctx.shaders.border.pxsize, (2.0 / ctx.canvas.height) / POINT_SIZE);
	ctx.gl.uniform1f(ctx.shaders.border.pxsize_rcp, 1.0 / ((2.0 / ctx.canvas.height) / POINT_SIZE));

	if (channel.alpha)
		ctx.gl.uniform1f(ctx.shaders.border.alpha, channel.alpha);
	else
		ctx.gl.uniform1f(ctx.shaders.border.alpha, 1);

	if (project_points) {
		/* Split-Screen rendering */
		if (width < ctx.canvas.width)
			ctx.gl.uniform4f(ctx.shaders.border.split, -0.5, 0, 0.5, 1);
		else if (height < ctx.canvas.height)
			ctx.gl.uniform4f(ctx.shaders.border.split, 0, 0.5, 1, 0.5);
		else
			ctx.gl.uniform4f(ctx.shaders.border.split, 0, 0, 1, 1);

		/* Each corner gets one viewray */
		const ray_topleft = glm.vec3.fromValues(
			ctx.shaders.viewrays[2],
			ctx.shaders.viewrays[3],
			ctx.shaders.viewrays[4],
		);
		const ray_topright = glm.vec3.fromValues(
			ctx.shaders.viewrays[7],
			ctx.shaders.viewrays[8],
			ctx.shaders.viewrays[9],
		);
		const ray_botright = glm.vec3.fromValues(
			ctx.shaders.viewrays[12],
			ctx.shaders.viewrays[13],
			ctx.shaders.viewrays[14],
		);
		const ray_botleft = glm.vec3.fromValues(
			ctx.shaders.viewrays[17],
			ctx.shaders.viewrays[18],
			ctx.shaders.viewrays[19],
		);

		/* TODO: Should use instanced rendering, but don't wanna check for
		   instanced rendering extension compatability just now. WebGL 1.0
		   without extensions should work. (Except NPOT textures) */

		/* Diagonal, Bottom-left -> Top-right */
		interp_border_pts(ray_botleft, ray_topright,
			subdiv * aspect * Math.SQRT2, aspect_ratio,
			COLOR_BOTLEFT, COLOR_TOPRIGHT, true, channel);
		/* Diagonal, Top-left -> Bottom-right */
		interp_border_pts(ray_topleft, ray_botright,
			subdiv * aspect * Math.SQRT2, aspect_ratio,
			COLOR_TOPLEFT, COLOR_BOTRIGHT, true, channel);
		/* Top */
		interp_border_pts(ray_topleft, ray_topright, subdiv * aspect,
			aspect_ratio, COLOR_TOPLEFT, COLOR_TOPRIGHT, false, channel);
		/* Right */
		interp_border_pts(ray_topright, ray_botright, subdiv, aspect_ratio,
			COLOR_TOPRIGHT, COLOR_BOTRIGHT, false, channel);
		/* Bottom */
		interp_border_pts(ray_botright, ray_botleft, subdiv * aspect,
			aspect_ratio, COLOR_BOTRIGHT, COLOR_BOTLEFT, false, channel);
		/* Left */
		interp_border_pts(ray_botleft, ray_topleft, subdiv, aspect_ratio,
			COLOR_BOTLEFT, COLOR_TOPLEFT, false, channel);
	} else {
		/* Split-Screen rendering */
		if (width < ctx.canvas.width)
			ctx.gl.uniform4f(ctx.shaders.border.split, 0.5, 0, 0.5, 1);
		else if (height < ctx.canvas.height)
			ctx.gl.uniform4f(ctx.shaders.border.split, 0, -0.5, 1, 0.5);
		else
			ctx.gl.uniform4f(ctx.shaders.border.split, 0, 0, 1, 1);

		const topleft = glm.vec2.fromValues(-1, 1);
		const topright = glm.vec2.fromValues(1, 1);
		const botright = glm.vec2.fromValues(1, -1);
		const botleft = glm.vec2.fromValues(-1, -1);

		/* Diagonal, Bottom-left -> Top-right */
		interp_border_pts_smp(botleft, topright, subdiv * aspect * Math.SQRT2,
			COLOR_BOTLEFT, COLOR_TOPRIGHT, true);
		/* Diagonal, Top-left -> Bottom-right */
		interp_border_pts_smp(topleft, botright, subdiv * aspect * Math.SQRT2,
			COLOR_TOPLEFT, COLOR_BOTRIGHT, true);
		/* Top */
		interp_border_pts_smp(topleft, topright, subdiv * aspect,
			COLOR_TOPLEFT, COLOR_TOPRIGHT, false);
		/* Right */
		interp_border_pts_smp(topright, botright, subdiv,
			COLOR_TOPRIGHT, COLOR_BOTRIGHT, false);
		/* Bottom */
		interp_border_pts_smp(botright, botleft, subdiv * aspect,
			COLOR_BOTRIGHT, COLOR_BOTLEFT, false);
		/* Left */
		interp_border_pts_smp(botleft, topleft, subdiv,
			COLOR_BOTLEFT, COLOR_TOPLEFT, false);
	}
}
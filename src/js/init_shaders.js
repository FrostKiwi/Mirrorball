import { compile_and_link } from './gl_basics.js'

import border_vs from '/shd/border.vs?raw'
import border_fs from '/shd/border.fs?raw'
import crop_vs from '/shd/crop.vs?raw'
import crop_fs from '/shd/crop.fs?raw'
import project_vs from '/shd/project.vs?raw'
import project_fs from '/shd/project.fs?raw'

function createBufferWithData(gl, data) {
	let buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return buffer;
}

export default function init_shaders(ctx, gl) {
	ctx.shaders.crop.handle = compile_and_link(gl, crop_vs, crop_fs);
	ctx.shaders.border.handle = compile_and_link(gl, border_vs, border_fs);
	ctx.shaders.project.handle = compile_and_link(gl, project_vs, project_fs);

	const unitquadtex = new Float32Array([
		-1.0, 1.0, 0.0, 0.0,
		1.0, 1.0, 1.0, 0.0,
		1.0, -1.0, 1.0, 1.0,
		-1.0, -1.0, 0.0, 1.0
	]);

	const unitquad_small = new Float32Array([
		-1.0, 1.0,
		1.0, 1.0,
		1.0, -1.0,
		-1.0, -1.0
	]);

	Object.assign(ctx.shaders.crop, {
		vtx: gl.getAttribLocation(ctx.shaders.crop.handle, "vtx"),
		coord: gl.getAttribLocation(ctx.shaders.crop.handle, "coord"),
		alpha: gl.getUniformLocation(ctx.shaders.crop.handle, "alpha"),
		scalar_rcp: gl.getUniformLocation(ctx.shaders.crop.handle, "scalar_rcp"),
		aspect_w: gl.getUniformLocation(ctx.shaders.crop.handle, "aspect_w"),
		aspect_h: gl.getUniformLocation(ctx.shaders.crop.handle, "aspect_h"),
		crop: gl.getUniformLocation(ctx.shaders.crop.handle, "crop"),
		split: gl.getUniformLocation(ctx.shaders.crop.handle, "split"),
		mask_toggle:
			gl.getUniformLocation(ctx.shaders.crop.handle, "mask_toggle"),
		area_toggle:
			gl.getUniformLocation(ctx.shaders.crop.handle, "area_toggle"),
		area_f: gl.getUniformLocation(ctx.shaders.crop.handle, "area_f"),
		area_b: gl.getUniformLocation(ctx.shaders.crop.handle, "area_b"),
		bgvbo: createBufferWithData(gl, unitquadtex)
	});

	Object.assign(ctx.shaders.border, {
		vtx: gl.getAttribLocation(ctx.shaders.border.handle, "vtx"),
		scale: gl.getUniformLocation(ctx.shaders.border.handle, "scale"),
		alpha: gl.getUniformLocation(ctx.shaders.border.handle, "alpha"),
		transform:
			gl.getUniformLocation(ctx.shaders.border.handle, "transform"),
		color: gl.getUniformLocation(ctx.shaders.border.handle, "color"),
		split: gl.getUniformLocation(ctx.shaders.border.handle, "split"),
		quadvbo: createBufferWithData(gl, unitquad_small)
	});

	Object.assign(ctx.shaders.project, {
		pos: gl.getAttribLocation(ctx.shaders.project.handle, "pos"),
		viewray: gl.getAttribLocation(ctx.shaders.project.handle, "rayvtx"),
		scaler: gl.getUniformLocation(ctx.shaders.project.handle, "scalar"),
		scaler_rcp: gl.getUniformLocation(ctx.shaders.project.handle, "scalar_rcp"),
		alpha: gl.getUniformLocation(ctx.shaders.project.handle, "alpha"),
		crop: gl.getUniformLocation(ctx.shaders.project.handle, "crop"),
		split: gl.getUniformLocation(ctx.shaders.project.handle, "split"),
		area_toggle:
			gl.getUniformLocation(ctx.shaders.project.handle, "area_toggle"),
		area_f: gl.getUniformLocation(ctx.shaders.project.handle, "area_f"),
		area_b: gl.getUniformLocation(ctx.shaders.project.handle, "area_b"),
		rayvbo: gl.createBuffer()
	});
}
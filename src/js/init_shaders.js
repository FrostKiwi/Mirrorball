import { compile_and_link } from './gl_basics.js'

/* Colorful dot distortion Shader */
import border_vs from '/shd/border.vs?raw'
import border_fs from '/shd/border.fs?raw'

/* Original image Shader for setup and preview */
import crop_vs from '/shd/crop.vs?raw'
import crop_fs from '/shd/crop.fs?raw'

/* Main projection Shader */
import project_vs from '/shd/project.vs?raw'
import project_fs from '/shd/project.fs?raw'
import project_AA_fs from '/shd/project_antialias.fs?raw'

/* For Export and Setup preview, Equirectangular aka Lat-Long */
import latlong_vs from '/shd/latlong.vs?raw'
import latlong_fs from '/shd/latlong.fs?raw'
import latlong_AA_fs from '/shd/latlong_antialias.fs?raw'

function createBufferWithData(gl, data) {
	let buffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	return buffer;
}

export default function init_shaders(ctx, ctr, gl) {
	/* Analytical Anti-Aliasing versions, if derivatives supported */
	if (gl.getExtension('OES_standard_derivatives')) {
		ctx.shaders.project.handle_AA = compile_and_link(gl, project_vs, project_AA_fs);
		ctx.shaders.latlong.handle_AA = compile_and_link(gl, latlong_vs, latlong_AA_fs);
	} else {
		ctr.tog.antialias = false;
		ctx.shaders.project.handle = compile_and_link(gl, project_vs, project_fs);
		ctx.shaders.latlong.handle = compile_and_link(gl, latlong_vs, latlong_fs);
	}

	ctx.shaders.crop.handle = compile_and_link(gl, crop_vs, crop_fs);
	ctx.shaders.border.handle = compile_and_link(gl, border_vs, border_fs);

	updateShaderAttributes(ctx, ctr, gl);
}

export function updateShaderAttributes(ctx, ctr, gl) {
	const unitquadtex = new Float32Array([
		-1.0, 1.0, 0.0, 0.0,
		1.0, 1.0, 1.0, 0.0,
		1.0, -1.0, 1.0, 1.0,
		-1.0, -1.0, 0.0, 1.0
	]);

	const unitquad_latlong = new Float32Array([
		-1.0, 1.0, 0.0, Math.PI * 2,
		1.0, 1.0, 0.0, 0.0,
		1.0, -1.0, Math.PI, 0.0,
		-1.0, -1.0, Math.PI, Math.PI * 2
	]);

	const unitquad_small = new Float32Array([
		-1.0, 1.0,
		1.0, 1.0,
		1.0, -1.0,
		-1.0, -1.0
	]);

	/* Depending on whether the Anti-Aliasing shader is needed or not, update
	   all attributes. */
	const aaSuffix = ctr.tog.antialias ? '_AA' : '';
	Object.assign(ctx.shaders.crop, {
		vtx: gl.getAttribLocation(ctx.shaders.crop.handle, "vtx"),
		coord: gl.getAttribLocation(ctx.shaders.crop.handle, "coord"),
		alpha: gl.getUniformLocation(ctx.shaders.crop.handle, "alpha"),
		scalar_rcp: gl.getUniformLocation(ctx.shaders.crop.handle, "scalar_rcp"),
		aspect_w: gl.getUniformLocation(ctx.shaders.crop.handle, "aspect_w"),
		aspect_h: gl.getUniformLocation(ctx.shaders.crop.handle, "aspect_h"),
		crop: gl.getUniformLocation(ctx.shaders.crop.handle, "crop"),
		pxsize: gl.getUniformLocation(ctx.shaders.crop.handle, "pxsize"),
		pxsize_rcp: gl.getUniformLocation(ctx.shaders.crop.handle, "pxsize_rcp"),
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
		pxsize: gl.getUniformLocation(ctx.shaders.border.handle, "pxsize"),
		pxsize_rcp: gl.getUniformLocation(ctx.shaders.border.handle, "pxsize_rcp"),
		scale: gl.getUniformLocation(ctx.shaders.border.handle, "scale"),
		alpha: gl.getUniformLocation(ctx.shaders.border.handle, "alpha"),
		transform:
			gl.getUniformLocation(ctx.shaders.border.handle, "transform"),
		color: gl.getUniformLocation(ctx.shaders.border.handle, "color"),
		split: gl.getUniformLocation(ctx.shaders.border.handle, "split"),
		quadvbo: createBufferWithData(gl, unitquad_small)
	});

	Object.assign(ctx.shaders.project, {
		pos: gl.getAttribLocation(ctx.shaders.project['handle' + aaSuffix], "pos"),
		viewray: gl.getAttribLocation(ctx.shaders.project['handle' + aaSuffix], "rayvtx"),
		scaler: gl.getUniformLocation(ctx.shaders.project['handle' + aaSuffix], "scalar"),
		alpha: gl.getUniformLocation(ctx.shaders.project['handle' + aaSuffix], "alpha"),
		crop: gl.getUniformLocation(ctx.shaders.project['handle' + aaSuffix], "crop"),
		split: gl.getUniformLocation(ctx.shaders.project['handle' + aaSuffix], "split"),
		area_toggle:
			gl.getUniformLocation(ctx.shaders.project['handle' + aaSuffix], "area_toggle"),
		area_f: gl.getUniformLocation(ctx.shaders.project['handle' + aaSuffix], "area_f"),
		area_b: gl.getUniformLocation(ctx.shaders.project['handle' + aaSuffix], "area_b"),
		rayvbo: gl.createBuffer()
	});

	Object.assign(ctx.shaders.latlong, {
		vtx: gl.getAttribLocation(ctx.shaders.latlong['handle' + aaSuffix], "vtx"),
		coord: gl.getAttribLocation(ctx.shaders.latlong['handle' + aaSuffix], "coord"),
		scaler: gl.getUniformLocation(ctx.shaders.latlong['handle' + aaSuffix], "scalar"),
		crop: gl.getUniformLocation(ctx.shaders.latlong['handle' + aaSuffix], "crop"),
		rotMat: gl.getUniformLocation(ctx.shaders.latlong['handle' + aaSuffix], "rotMat"),
		alpha: gl.getUniformLocation(ctx.shaders.latlong['handle' + aaSuffix], "alpha"),
		bgvbo: createBufferWithData(gl, unitquad_latlong)
	});
}
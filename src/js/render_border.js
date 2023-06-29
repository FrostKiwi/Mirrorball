import ctx from './state.js';
import * as glm from 'gl-matrix';

export default function render_border() {
	const aspect = ctx.canvas.width / ctx.canvas.height;

	ctx.gl.useProgram(ctx.shaders.border.handle);

	glBindBuffer(GL_ARRAY_BUFFER, gctx.border_shader.quadvbo);
	ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, ctx.shaders.border.quadvbo);
	ctx.gl.enableVertexAttribArray(ctx.shaders.border.vtx);

	const postcrop_w =
		ctx.ch1.w - (ctx.ch1.crop.left + ctx.ch1.crop.right);
	const postcrop_h =
		ctx.ch1.h - (ctx.ch1.crop.top + ctx.ch1.crop.bot);

	const aspect_ratio = glm.vec2.create();

	if (postcrop_h / postcrop_w > ctx.canvas.height / ctx.canvas.width)
		aspect_ratio[0] =
			(postcrop_w / postcrop_h) / (ctx.canvas.width / ctx.canvas.height);
	else
		aspect_ratio[1] =
			(postcrop_h / postcrop_w) / (ctx.canvas.height / ctx.canvas.width);

	ctx.gl.vertexAttribPointer(ctx.shaders.border.vtx, 2, ctx.gl.FLOAT, false,
		2 * Float32Array.BYTES_PER_ELEMENT, 0);

	if (ctx.gui.project) {
		const scale = 
				vec2s scale = {POINT_SIZE / aspect, POINT_SIZE};
		scale = vec2_scale(scale, 0.8);
		glUniform2fv(gctx.border_shader.scale,
					 1,
					 scale.raw);
	} else {

	}
}
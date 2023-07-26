import { ctx, ctr } from './state.js';

export default function render_crop(width, height, channel) {
	/* Crop Shader */
	const postcrop_w =
		ctx.shaders.ch1.w - (channel.crop.left + channel.crop.right);
	const postcrop_h =
		ctx.shaders.ch1.h - (channel.crop.top + channel.crop.bot);
	const crop = {
		x: (1 / ctx.shaders.ch1.w) * channel.crop.left,
		y: (1 / ctx.shaders.ch1.h) * channel.crop.top,
		w: (1 / ctx.shaders.ch1.w) * postcrop_w,
		h: (1 / ctx.shaders.ch1.h) * postcrop_h
	}

	ctx.gl.useProgram(ctx.shaders.crop.handle);

	/* Split-Screen rendering */
	if (width < ctx.canvas.width)
		ctx.gl.uniform4f(ctx.shaders.crop.split, -0.5, 0, 0.5, 1);
	else if (height < ctx.canvas.height)
		ctx.gl.uniform4f(ctx.shaders.crop.split, 0, 0.5, 1, 0.5);
	else
		ctx.gl.uniform4f(ctx.shaders.crop.split, 0, 0, 1, 1);

	ctx.gl.uniform4f(ctx.shaders.crop.crop, crop.x, crop.y, crop.w, crop.h);
	ctx.gl.uniform1i(ctx.shaders.crop.mask_toggle, ctr.tog.mask);

	if (postcrop_h / postcrop_w > height / width) {
		ctx.gl.uniform1f(ctx.shaders.crop.aspect_h, 1.0);
		ctx.gl.uniform1f(
			ctx.shaders.crop.aspect_w,
			(postcrop_w / postcrop_h) / (width / height));
	} else {
		ctx.gl.uniform1f(ctx.shaders.crop.aspect_h,
			(postcrop_h / postcrop_w) / (height / width));
		ctx.gl.uniform1f(ctx.shaders.crop.aspect_w, 1.0);
	}

	if (channel.alpha)
		ctx.gl.uniform1f(ctx.shaders.crop.alpha, channel.alpha);
	else
		ctx.gl.uniform1f(ctx.shaders.crop.alpha, 1);

	ctx.gl.bindBuffer(ctx.gl.ARRAY_BUFFER, ctx.shaders.crop.bgvbo);
	ctx.gl.enableVertexAttribArray(ctx.shaders.crop.vtx);
	ctx.gl.enableVertexAttribArray(ctx.shaders.crop.coord);
	ctx.gl.vertexAttribPointer(ctx.shaders.crop.vtx, 2, ctx.gl.FLOAT, false,
		4 * Float32Array.BYTES_PER_ELEMENT, 0);
	ctx.gl.vertexAttribPointer(ctx.shaders.crop.coord, 2, ctx.gl.FLOAT, false,
		4 * Float32Array.BYTES_PER_ELEMENT,
		2 * Float32Array.BYTES_PER_ELEMENT);

	ctx.gl.drawArrays(ctx.gl.TRIANGLE_FAN, 0, 4);
}
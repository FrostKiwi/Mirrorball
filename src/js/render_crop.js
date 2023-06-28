export function render_crop(ctx, gl, w, h){
	/* Crop Shader */
	const postcrop_w =
		ctx.ch1.w - (ctx.ch1.crop.left + ctx.ch1.crop.right);
	const postcrop_h =
		ctx.ch1.h - (ctx.ch1.crop.top + ctx.ch1.crop.bot);
	const crop = {
		x: (1.0 / ctx.ch1.w) * ctx.ch1.crop.left,
		y: (1.0 / ctx.ch1.h) * ctx.ch1.crop.top,
		w: (1.0 / ctx.ch1.w) * postcrop_w,
		h: (1.0 / ctx.ch1.h) * postcrop_h
	}

	gl.useProgram(ctx.shaders.crop.handle);

	gl.uniform4f(ctx.shaders.crop.crop, crop.x, crop.y, crop.w, crop.h);
	gl.uniform1i(ctx.shaders.crop.mask_toggle, ctx.shaders.crop.mask);

	if (postcrop_h / postcrop_w > h / w) {
		gl.uniform1f(ctx.shaders.crop.aspect_h, 1.0);
		gl.uniform1f(
			ctx.shaders.crop.aspect_w,
			(postcrop_w / postcrop_h) / (w / h));
	} else {
		gl.uniform1f(ctx.shaders.crop.aspect_h,
			(postcrop_h / postcrop_w) / (h / w));
		gl.uniform1f(ctx.shaders.crop.aspect_w, 1.0);
	}

	gl.bindBuffer(gl.ARRAY_BUFFER, ctx.shaders.crop.bgvbo);
	gl.enableVertexAttribArray(ctx.shaders.crop.vtx);
	gl.enableVertexAttribArray(ctx.shaders.crop.coord);
	gl.vertexAttribPointer(ctx.shaders.crop.vtx, 2, gl.FLOAT, false,
		4 * Float32Array.BYTES_PER_ELEMENT, 0);
	gl.vertexAttribPointer(ctx.shaders.crop.coord, 2, gl.FLOAT, false,
		4 * Float32Array.BYTES_PER_ELEMENT,
		2 * Float32Array.BYTES_PER_ELEMENT);

	gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
}
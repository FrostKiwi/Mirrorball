import { ctx, ctr, redraw } from './state.js';
import media from './mediaData.js'

export function media_populate() {
	let mediaDiv = document.getElementById('media');
	media.forEach(media => {
		let card = document.createElement('div');
		card.className = 'card';
		card.onclick = function () {
			if (!ctx.loading) {
				load_from_url(media);
				closeMenu();
			}
		};
		card.innerHTML = `
			<div class="card-header">
				<img src="style/img/${media.type}.svg" style="color: #6d0129;" class="card-icon">
				<h2 class="card-title">${media.title}</h2>
			</div>
			<img class="card-image" src="${media.thumb}" alt="Thumbnail">
			<div class="card-description">
				<p class="card-field">File Size: <span class="file-size">${media.fileSize}</span></p>
				<p class="card-field">Dimensions: <span class="dimensions">${media.dimensions}</span></p>
				<p class="card-field">Submitter: <span class="submitter">${media.submitter}</span></p>
			</div>`;
		mediaDiv.appendChild(card);
	});
};

export async function load_from_url(media) {
	ctx.loading = true;

	ctx.dom.spinner.style.display = 'block';
	ctx.gui.handle.hide();
	try {
		ctx.dom.statusMSG.innerText = "Requesting " + media.path;
		const response = await fetch(media.path);
		ctx.dom.statusMSG.innerText = "Downloading " + media.path;
		ctx.dom.filesize.innerText = "(" +
			((response.headers.get('Content-Length') / 1000000)).toFixed(2) +
			" MegaByte" + ")";
		const blob = await response.blob();
		ctx.dom.statusMSG.innerText = "Decoding image";
		const bitmap = await createImageBitmap(blob);

		ctr.ch1.fov_deg = media.sphere_fov;
		ctr.cam.rot_deg[0] = media.camera_inital.Pitch;
		ctr.cam.rot_deg[1] = media.camera_inital.Yaw;
		ctr.ch1.rot_deg[0] = media.world_rotation.Pitch;
		ctr.ch1.rot_deg[1] = media.world_rotation.Yaw;
		ctr.ch1.rot_deg[2] = media.world_rotation.Roll;
		ctx.gui.controller.world_pitch.updateDisplay();
		ctx.gui.controller.world_yaw.updateDisplay();
		ctx.gui.controller.world_roll.updateDisplay();
		ctx.gui.controller.cam_pitch.updateDisplay();
		ctx.gui.controller.cam_yaw.updateDisplay();
		ctx.gui.controller.img_fov.updateDisplay();

		media_setup(bitmap, media.crop);

	} catch (err) {
		console.error(err);
	}
}

function media_setup(bitmap, crop) {
	ctx.dom.statusMSG.innerText = "Transfering into GPU memory";
	ctx.gui.controller.left.max(bitmap.width / 2).setValue(crop.left);
	ctx.gui.controller.right.max(bitmap.width / 2).setValue(crop.right);
	ctx.gui.controller.top.max(bitmap.height / 2).setValue(crop.top);
	ctx.gui.controller.bot.max(bitmap.height / 2).setValue(crop.bot);

	ctx.gl.deleteTexture(ctx.shaders.ch1.tex);
	ctx.shaders.ch1.tex = ctx.gl.createTexture();
	ctx.gl.bindTexture(ctx.gl.TEXTURE_2D, ctx.shaders.ch1.tex);
	ctx.gl.texParameteri(
		ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_WRAP_S, ctx.gl.CLAMP_TO_EDGE);
	ctx.gl.texParameteri(
		ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_WRAP_T, ctx.gl.CLAMP_TO_EDGE);
	ctx.gl.texParameteri(
		ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_MIN_FILTER, ctx.gl.LINEAR);
	ctx.gl.texParameteri(
		ctx.gl.TEXTURE_2D, ctx.gl.TEXTURE_MAG_FILTER, ctx.gl.LINEAR);

	ctx.shaders.ch1.w = bitmap.width;
	ctx.shaders.ch1.h = bitmap.height;
	ctx.gl.texImage2D(ctx.gl.TEXTURE_2D, 0, ctx.gl.RGBA, ctx.gl.RGBA,
		ctx.gl.UNSIGNED_BYTE, bitmap);
	bitmap.close();
	ctx.gui.handle.show();
	ctx.dom.spinner.style.display = 'none';
	ctx.dom.statusMSG.innerText = "\u00A0";
	ctx.dom.filesize.innerText = "\u00A0";
	ctx.loading = false;

	/* Have to call a redraw here, since this function is called async */
	ctx.redraw = true;
	redraw();
}

/* Defined twice and three times if we count the toggle menu button,
   need to clean this up. */
function closeMenu() {
	const menu = document.getElementById('menu');
	menu.style.display = 'none';
}
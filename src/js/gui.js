import { ctx, ctr, redraw } from './state.js';
import GUI from 'lil-gui';

export default function init_gui() {
	ctx.gui.handle = new GUI().hide();
	ctx.gui.handle.title("Controls (Show / Hide)");
	ctx.gui.handle.add(ctx.gui, 'menu').name("Toggle Main Menu");
	ctx.gui.handle.add(ctr.tog, 'crop').name("Original").onChange(redraw);
	ctx.gui.handle.add(ctr.tog, 'project').name("Projection").onChange(redraw);

	/* Visualizations */
	ctx.gui.folder.viz = ctx.gui.handle.addFolder('Visualizations').open();
	ctx.gui.folder.viz.add(ctr.tog, 'mask').name(
		"Circle Mask"
	).onChange(redraw);
	ctx.gui.folder.viz.add(ctr.tog, 'viz').name(
		"Project screen border"
	).onChange(redraw);

	ctx.gui.folder.camera = ctx.gui.handle.addFolder('Camera').close();
	ctx.gui.controller.cam_fov = ctx.gui.folder.camera.add(
		ctr.cam.fov, 'cur', ctx.cam.fov.min, ctx.cam.fov.max, 1).name(
			"Vertical FOV [in °]"
		).onChange(redraw);
	ctx.gui.controller.pitch = ctx.gui.folder.camera.add(
		ctr.cam.rot_deg, '0', -90, 90).name("Pitch [in °]").onChange(redraw);
	ctx.gui.controller.yaw = ctx.gui.folder.camera.add(
		ctr.cam.rot_deg, '1', -180, 180).name("Yaw [in °]").onChange(redraw);

	/* Projection Controls */
	ctx.gui.folder.setup =
		ctx.gui.handle.addFolder('Image and projection setup').close();

	/* Sphere's FOV / Distortion correction */
	ctx.gui.controller.img_fov =
		ctx.gui.folder.setup.add(ctr.ch1, 'fov_deg', 180, 360, 1).name(
			"Sphere's FOV [in °]"
		).onChange(redraw);

	/* Crop */
	ctx.gui.folder.crop = ctx.gui.folder.setup.addFolder('Image crop');
	ctx.gui.controller.top =
		ctx.gui.folder.crop.add(ctr.ch1.crop, 'top', 0, 1, 1).onChange(redraw);
	ctx.gui.controller.top.name("Top [px]");
	ctx.gui.controller.bot =
		ctx.gui.folder.crop.add(ctr.ch1.crop, 'bot', 0, 1, 1).onChange(redraw);
	ctx.gui.controller.bot.name("Bottom [px]");
	ctx.gui.controller.left =
		ctx.gui.folder.crop.add(ctr.ch1.crop, 'left', 0, 1, 1).onChange(redraw);
	ctx.gui.controller.left.name("Left [px]");
	ctx.gui.controller.right =
		ctx.gui.folder.crop.add(
			ctr.ch1.crop, 'right', 0, 1, 1).onChange(redraw);
	ctx.gui.controller.right.name("Right [px]");
	ctx.gui.folder.crop.add(ctx.gui, 'crop_negative').onChange(
		toggle_crop_negative).name("Allow negative");

	/* World rotation */
	ctx.gui.folder.world = ctx.gui.folder.setup.addFolder('World Rotation');
	ctx.gui.folder.world.add(ctr.ch1.rot_deg, '0', -180, 180).name(
		"Pitch [in °]"
	).onChange(redraw);
	ctx.gui.folder.world.add(ctr.ch1.rot_deg, '1', -180, 180).name(
		"Yaw [in °]"
	).onChange(redraw);
	ctx.gui.folder.world.add(ctr.ch1.rot_deg, '2', -180, 180).name(
		"Roll [in °]"
	).onChange(redraw);

	ctx.gui.folder.settings = ctx.gui.handle.addFolder('Settings').close();

	const elem = document.documentElement;
	if (elem.requestFullscreen || elem.webkitRequestFullscreen)
		ctx.gui.folder.settings.add(ctx.gui, 'fullscreen').name("Fullscreen");
	else
		ctx.gui.folder.settings.add(ctx.gui, 'fullscreen').name(
			"Fullscreen not supported by browser"
		).disable();

	ctx.gui.folder.settings.add(ctr.tog, 'viz_subdiv', 2, 256, 1).name(
		"Visualization subdivisions"
	).onChange(redraw);
	ctx.gui.folder.debug = ctx.gui.folder.settings.addFolder('Debug').close();
	ctx.gui.folder.debug.add(ctx.gui, 'showStats').name(
		"Show performance"
	).onChange(toggleStats);
	ctx.gui.folder.debug.add(ctx.gui, 'showEventStats').name(
		"Show rejected redraws"
	).onChange(toggleEventsStats);
	ctx.gui.folder.debug.add(ctx.gui, 'eruda').name(
		"Eruda debug console"
	).onChange(eruda_toggle);
}

function toggleStats(value) {
	ctx.stats.dom.style.display = value ? 'block' : 'none';
}
function toggleEventsStats(value) {
	ctx.stats_events.dom.style.display = value ? 'block' : 'none';
}

function toggle_crop_negative(value) {
	if (value) {
		ctx.gui.controller.left.min(ctx.shaders.ch1.w * -2);
		ctx.gui.controller.right.min(ctx.shaders.ch1.w * -2);
		ctx.gui.controller.top.min(ctx.shaders.ch1.h * -2);
		ctx.gui.controller.bot.min(ctx.shaders.ch1.h * -2);
	} else {
		ctx.gui.controller.left.min(0);
		ctx.gui.controller.right.min(0);
		ctx.gui.controller.top.min(0);
		ctx.gui.controller.bot.min(0);
	}
	ctx.gui.controller.left.updateDisplay();
	ctx.gui.controller.right.updateDisplay();
	ctx.gui.controller.top.updateDisplay();
	ctx.gui.controller.bot.updateDisplay();
}

function eruda_toggle(value) {
	if (value) {  // If the checkbox is checked
		if (window.eruda) {  // If Eruda is already loaded
			eruda.init();
		} else {  // If Eruda is not loaded
			let script = document.createElement('script');
			script.src = "//cdn.jsdelivr.net/npm/eruda";
			script.onload = function () {
				eruda.init();
			};
			document.body.appendChild(script);
		}
	} else {  // If the checkbox is unchecked
		if (window.eruda) {  // If Eruda is already loaded
			eruda.destroy();
		}
	}
}
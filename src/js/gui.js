import { ctx, ctr, redraw } from './state.js';
import { print_glinfo } from './gl_basics.js'
import GUI from 'lil-gui';

export default function init_gui() {
	ctx.gui.handle = new GUI().hide();
	ctx.gui.handle.title("Controls (Show / Hide)");
	ctx.gui.handle.add(ctx.gui, 'menu').name("Select Media");
	ctx.gui.handle.add(ctr.tog, 'crop').name("Original").onChange(redraw);
	ctx.gui.handle.add(ctr.tog, 'project').name("Projection").onChange(redraw);
	ctx.gui.controller.alpha =
		ctx.gui.handle.add(ctr.ch2, 'alpha', 0, 1, 0.1).name(
			"Multi-Source Mix"
		).onChange(redraw);

	/* Visualizations */
	ctx.gui.folder.viz = ctx.gui.handle.addFolder('Visualizations').open();
	ctx.gui.folder.viz.add(ctr.tog, 'mask').name(
		"Ball Mask"
	).onChange(redraw);
	ctx.gui.folder.viz.add(ctr.tog, 'viz').name(
		"Mapping and Distortion"
	).onChange(redraw);
	ctx.gui.folder.viz.add(ctr.tog, 'area').name(
		"Projection Area (Solid Angle)"
	).onChange(redraw);
	ctx.gui.controller.area_f = ctx.gui.folder.viz.add(
		ctr.tog, 'area_f', 0, 360, 1).name(
			"Solid angle front [in °]"
		).onChange(redraw);
	ctx.gui.controller.area_b = ctx.gui.folder.viz.add(
		ctr.tog, 'area_b', 0, 360, 1).name(
			"Solid angle front [in °]"
		).onChange(redraw);

	ctx.gui.folder.camera = ctx.gui.handle.addFolder('Camera').close();
	ctx.gui.controller.cam_fov = ctx.gui.folder.camera.add(
		ctr.cam.fov, 'cur', ctx.cam.fov.min, ctx.cam.fov.max, 1).name(
			"Vertical FOV [in °]"
		).onChange(redraw);
	ctx.gui.controller.cam_yaw = ctx.gui.folder.camera.add(
		ctr.cam.rot_deg, '1', -180, 180).name("Yaw [in °]").onChange(redraw);
	ctx.gui.controller.cam_pitch = ctx.gui.folder.camera.add(
		ctr.cam.rot_deg, '0', -90, 90).name("Pitch [in °]").onChange(redraw);

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
		ctx.gui.folder.crop.add(ctr.ch1.crop, 'top', 0, 1, 1).onChange(
			recalc_croplimits);
	ctx.gui.controller.top.name("Top [px]");
	ctx.gui.controller.bot =
		ctx.gui.folder.crop.add(ctr.ch1.crop, 'bot', 0, 1, 1).onChange(
			recalc_croplimits);
	ctx.gui.controller.bot.name("Bottom [px]");
	ctx.gui.controller.left =
		ctx.gui.folder.crop.add(ctr.ch1.crop, 'left', 0, 1, 1).onChange(
			recalc_croplimits);
	ctx.gui.controller.left.name("Left [px]");
	ctx.gui.controller.right =
		ctx.gui.folder.crop.add(ctr.ch1.crop, 'right', 0, 1, 1).onChange(
			recalc_croplimits);
	ctx.gui.controller.right.name("Right [px]");
	ctx.gui.folder.crop.add(ctx.gui, 'crop_negative').onChange(
		toggle_crop_negative).name("Allow negative");

	/* World rotation */
	ctx.gui.folder.world = ctx.gui.folder.setup.addFolder('World Rotation');
	ctx.gui.controller.world_yaw =
		ctx.gui.folder.world.add(ctr.ch1.rot_deg, '1', -180, 180).name(
			"Yaw [in °]"
		).onChange(redraw);
	ctx.gui.controller.world_pitch =
		ctx.gui.folder.world.add(ctr.ch1.rot_deg, '0', -180, 180).name(
			"Pitch [in °]"
		).onChange(redraw);
	ctx.gui.controller.world_roll =
		ctx.gui.folder.world.add(ctr.ch1.rot_deg, '2', -180, 180).name(
			"Roll [in °]"
		).onChange(redraw);

	channel2_setup();

	ctx.gui.folder.settings = ctx.gui.handle.addFolder('Settings').close();

	const elem = document.documentElement;
	if (elem.requestFullscreen || elem.webkitRequestFullscreen)
		ctx.gui.folder.settings.add(ctx.gui, 'fullscreen').name("Fullscreen");
	else
		ctx.gui.folder.settings.add(ctx.gui, 'fullscreen').name(
			"Fullscreen not supported by browser"
		).disable();

	ctx.gui.folder.settings.add(ctx.gui, 'deadzone', 0, 0.75).name(
		"Gamepad deadzone"
	);
	ctx.gui.folder.settings.add(ctr.tog, 'viz_subdiv', 2, 256, 1).name(
		"Visualization subdivisions"
	).onChange(redraw);
	ctx.gui.folder.settings.add(ctx.gui, 'blur').name(
		"Menu blur"
	).onChange(toggleBlur);
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

export function recalc_croplimits() {
	ctx.gui.controller.left.max(
		ctx.shaders.ch1.w - ctr.ch1.crop.right - 1);
	ctx.gui.controller.right.max(
		ctx.shaders.ch1.w - ctr.ch1.crop.left - 1);
	ctx.gui.controller.top.max(
		ctx.shaders.ch1.h - ctr.ch1.crop.bot - 1);
	ctx.gui.controller.bot.max(
		ctx.shaders.ch1.h - ctr.ch1.crop.top - 1);
	ctx.gui.controller.left.updateDisplay();
	ctx.gui.controller.right.updateDisplay();
	ctx.gui.controller.top.updateDisplay();
	ctx.gui.controller.bot.updateDisplay();

	/* 2nd Channel */
	ctx.gui.controller.left_ch2.max(
		ctx.shaders.ch1.w - ctr.ch2.crop.right - 1);
	ctx.gui.controller.right_ch2.max(
		ctx.shaders.ch1.w - ctr.ch2.crop.left - 1);
	ctx.gui.controller.top_ch2.max(
		ctx.shaders.ch1.h - ctr.ch2.crop.bot - 1);
	ctx.gui.controller.bot_ch2.max(
		ctx.shaders.ch1.h - ctr.ch2.crop.top - 1);
	ctx.gui.controller.left_ch2.updateDisplay();
	ctx.gui.controller.right_ch2.updateDisplay();
	ctx.gui.controller.top_ch2.updateDisplay();
	ctx.gui.controller.bot_ch2.updateDisplay();

	if (!ctx.loading)
		redraw();
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
				print_glinfo();
			};
			document.body.appendChild(script);
		}
	} else {  // If the checkbox is unchecked
		if (window.eruda) {  // If Eruda is already loaded
			eruda.destroy();
		}
	}
}

function toggleBlur(value) {
	if (value) {
		document.documentElement.style.setProperty('--blur', 'blur(calc(1vw + 1vh))');
	} else {
		document.documentElement.style.setProperty('--blur', 'none');
	}
}

function channel2_setup() {
	/* Channel 2 */
	ctx.gui.folder.ch2 =
		ctx.gui.folder.setup.addFolder('Media Overlay').close();

	/* Channel 2 */
	/* Sphere's FOV / Distortion correction */
	ctx.gui.controller.img_fov_ch2 =
		ctx.gui.folder.ch2.add(ctr.ch2, 'fov_deg', 180, 360, 1).name(
			"Sphere's FOV [in °]"
		).onChange(redraw);

	/* Channel 2 */
	/* Crop */
	ctx.gui.folder.crop_ch2 = ctx.gui.folder.ch2.addFolder('Image crop');
	ctx.gui.controller.top_ch2 =
		ctx.gui.folder.crop_ch2.add(ctr.ch2.crop, 'top', 0, 1, 1).onChange(
			recalc_croplimits);
	ctx.gui.controller.top_ch2.name("Top [px]");
	ctx.gui.controller.bot_ch2 =
		ctx.gui.folder.crop_ch2.add(ctr.ch2.crop, 'bot', 0, 1, 1).onChange(
			recalc_croplimits);
	ctx.gui.controller.bot_ch2.name("Bottom [px]");
	ctx.gui.controller.left_ch2 =
		ctx.gui.folder.crop_ch2.add(ctr.ch2.crop, 'left', 0, 1, 1).onChange(
			recalc_croplimits);
	ctx.gui.controller.left_ch2.name("Left [px]");
	ctx.gui.controller.right_ch2 =
		ctx.gui.folder.crop_ch2.add(
			ctr.ch2.crop, 'right', 0, 1, 1).onChange(recalc_croplimits);
	ctx.gui.controller.right_ch2.name("Right [px]");
	ctx.gui.folder.crop_ch2.add(ctx.gui, 'crop_negative').onChange(
		toggle_crop_negative_ch2).name("Allow negative");

	/* Channel 2 */
	/* World rotation */
	ctx.gui.folder.world_ch2 = ctx.gui.folder.ch2.addFolder('World Rotation');
	ctx.gui.controller.world_yaw_ch2 =
		ctx.gui.folder.world_ch2.add(ctr.ch2.rot_deg, '1', -180, 180).name(
			"Yaw [in °]"
		).onChange(redraw);
	ctx.gui.controller.world_pitch_ch2 =
		ctx.gui.folder.world_ch2.add(ctr.ch2.rot_deg, '0', -180, 180).name(
			"Pitch [in °]"
		).onChange(redraw);
	ctx.gui.controller.world_roll_ch2 =
		ctx.gui.folder.world_ch2.add(ctr.ch2.rot_deg, '2', -180, 180).name(
			"Roll [in °]"
		).onChange(redraw);
}

export function channel2_disable() {
	ctx.gui.folder
	ctx.gui.controller.alpha.setValue(0);
	ctx.gui.folder.ch2.close();
	ctx.gui.controller.alpha.disable();
	ctx.gui.controller.img_fov_ch2.disable();
	ctx.gui.controller.top_ch2.disable();
	ctx.gui.controller.bot_ch2.disable();
	ctx.gui.controller.left_ch2.disable();
	ctx.gui.controller.right_ch2.disable();
	ctx.gui.controller.world_yaw_ch2.disable();
	ctx.gui.controller.world_pitch_ch2.disable();
	ctx.gui.controller.world_roll_ch2.disable();
}

export function channel2_enable() {
	ctx.gui.controller.alpha.enable();
	ctx.gui.controller.img_fov_ch2.enable();
	ctx.gui.controller.top_ch2.enable();
	ctx.gui.controller.bot_ch2.enable();
	ctx.gui.controller.left_ch2.enable();
	ctx.gui.controller.right_ch2.enable();
	ctx.gui.controller.world_yaw_ch2.enable();
	ctx.gui.controller.world_pitch_ch2.enable();
	ctx.gui.controller.world_roll_ch2.enable();
}

function toggle_crop_negative_ch2(value) {
	if (value) {
		ctx.gui.controller.left_ch2.min(ctx.shaders.ch1.w * -2);
		ctx.gui.controller.right_ch2.min(ctx.shaders.ch1.w * -2);
		ctx.gui.controller.top_ch2.min(ctx.shaders.ch1.h * -2);
		ctx.gui.controller.bot_ch2.min(ctx.shaders.ch1.h * -2);
	} else {
		ctx.gui.controller.left_ch2.min(0);
		ctx.gui.controller.right_ch2.min(0);
		ctx.gui.controller.top_ch2.min(0);
		ctx.gui.controller.bot_ch2.min(0);
	}
	ctx.gui.controller.left_ch2.updateDisplay();
	ctx.gui.controller.right_ch2.updateDisplay();
	ctx.gui.controller.top_ch2.updateDisplay();
	ctx.gui.controller.bot_ch2.updateDisplay();
}
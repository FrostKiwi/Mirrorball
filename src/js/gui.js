import ctx from './state.js';
import GUI from 'lil-gui';

export default function init_gui() {
	ctx.gui.handle = new GUI();
	ctx.gui.handle.title("Controls (Show / Hide)");
	ctx.gui.handle.add(ctx.gui, 'menu').name("Toggle Main Menu");
	ctx.gui.handle.add(ctx.gui, 'crop').name("Original");
	ctx.gui.handle.add(ctx.gui, 'project').name("Projection");
	ctx.gui.controller.img_fov =
		ctx.gui.handle.add(ctx.ch1, 'fov_deg', 180, 360, 1);
	ctx.gui.controller.img_fov.name("Sphere's FOV [in °]");

	/* Vizualizations */
	ctx.gui.folder.viz = ctx.gui.handle.addFolder('Vizualizations').close();
	ctx.gui.folder.viz.add(ctx.shaders.crop, 'mask').name("Circle Mask");
	ctx.gui.folder.viz.add(ctx.gui, 'viz').name("Project screen border");

	ctx.gui.folder.camera = ctx.gui.handle.addFolder('Camera');
	ctx.gui.folder.camera.add(
		ctx.cam.fov, 'cur', ctx.cam.fov.min, ctx.cam.fov.max, 1).name(
			"FOV / Zoom [in °]"
		);
	ctx.gui.folder.camera.add(
		ctx.cam.rot_deg, '0', -90, 90).name("Pitch [in °]");
	ctx.gui.folder.camera.add(
		ctx.cam.rot_deg, '1', -180, 180).name("Yaw [in °]");

	/* World rotation */
	ctx.gui.folder.world = ctx.gui.handle.addFolder('World Rotation').close();
	ctx.gui.folder.world.add(ctx.ch1.rot_deg, '0', -180, 180).name(
		"Pitch [in °]"
	);
	ctx.gui.folder.world.add(ctx.ch1.rot_deg, '1', -180, 180).name(
		"Yaw [in °]"
	);
	ctx.gui.folder.world.add(ctx.ch1.rot_deg, '2', -180, 180).name(
		"Roll [in °]"
	);

	/* Crop */
	ctx.gui.folder.crop = ctx.gui.handle.addFolder('Crop').close();
	ctx.gui.controller.top =
		ctx.gui.folder.crop.add(ctx.ch1.crop, 'top', 0, 1, 1);
	ctx.gui.controller.top.name("Top [px]");
	ctx.gui.controller.bot =
		ctx.gui.folder.crop.add(ctx.ch1.crop, 'bot', 0, 1, 1);
	ctx.gui.controller.bot.name("Bottom [px]");
	ctx.gui.controller.left =
		ctx.gui.folder.crop.add(ctx.ch1.crop, 'left', 0, 1, 1);
	ctx.gui.controller.left.name("Left [px]");
	ctx.gui.controller.right =
		ctx.gui.folder.crop.add(ctx.ch1.crop, 'right', 0, 1, 1);
	ctx.gui.controller.right.name("Right [px]");
	ctx.gui.folder.crop.add(ctx.gui, 'crop_negative').onChange(
		toggle_crop_negative).name("Allow negative");

	ctx.gui.folder.settings = ctx.gui.handle.addFolder('Settings').close();
	ctx.gui.folder.settings.add(ctx.gui, 'fullscreen').name("Fullscreen");
	ctx.gui.folder.settings.add(ctx.gui, 'viz_subdiv', 1, 256, 1).name(
		"Visualization subdivisions"
	);
	ctx.gui.folder.settings.add(ctx.gui, 'showStats').name(
		"Show performance"
	).onChange(toggleStats);
	/* Trigger the function to apply the defaults stats value */
	/* Commented out during DEBUG! */
	/* toggleStats(); */
}

function toggleStats(value) {
	ctx.stats.dom.style.display = value ? 'block' : 'none';
}

function toggle_crop_negative(value) {
	if (value) {
		ctx.gui.controller.left.min(ctx.ch1.w * -2);
		ctx.gui.controller.right.min(ctx.ch1.w * -2);
		ctx.gui.controller.top.min(ctx.ch1.h * -2);
		ctx.gui.controller.bot.min(ctx.ch1.h * -2);
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
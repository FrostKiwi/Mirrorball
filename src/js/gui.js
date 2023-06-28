import ctx from './state.js';
import { GUI } from 'lil-gui';

export function init_gui() {
	ctx.gui.handle = new GUI();

	ctx.gui.handle.add(ctx.gui, 'crop').name("Original");

	ctx.gui.folder.viz = ctx.gui.handle.addFolder('Vizualizations');
	ctx.gui.folder.crop = ctx.gui.handle.addFolder('Crop');
	ctx.gui.folder.camera = ctx.gui.handle.addFolder('Camera');
	ctx.gui.folder.settings = ctx.gui.handle.addFolder('Settings');


	/* Setup up changable sliders */
	ctx.gui.controller = {};

	ctx.gui.controller.top =
		ctx.gui.folder.crop.add(ctx.ch1.crop, 'top', 0).name("Top (px)");
	ctx.gui.controller.bot =
		ctx.gui.folder.crop.add(ctx.ch1.crop, 'bot', 0).name("Bottom (px)");
	ctx.gui.controller.left =
		ctx.gui.folder.crop.add(ctx.ch1.crop, 'left', 0).name("Left (px)");
	ctx.gui.controller.right =
		ctx.gui.folder.crop.add(ctx.ch1.crop, 'right', 0).name("Right (px)");

	ctx.gui.folder.viz.add(ctx.shaders.crop, 'mask');

	ctx.gui.folder.settings.add(ctx.gui, 'showStats').onChange(toggleStats);
	/* Trigger the function to apply the defaults stats value */
	toggleStats();
}

function toggleStats(value) {
	ctx.stats.dom.style.display = value ? 'block' : 'none';
}

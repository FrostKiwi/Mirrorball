import ctx from './state.js';
import { GUI } from 'dat.gui';

export function init_gui() {

	ctx.gui.handle = new GUI();

	ctx.gui.folder.viz = ctx.gui.handle.addFolder( 'Vizualizations' );
	ctx.gui.folder.crop = ctx.gui.handle.addFolder( 'Crop' );
	ctx.gui.folder.camera = ctx.gui.handle.addFolder( 'Camera' );
	ctx.gui.folder.settings = ctx.gui.handle.addFolder( 'Settings' );

	ctx.gui.controller = {};

	ctx.gui.controller.top = ctx.gui.folder.crop.add( ctx.ch1.crop, 'top' );
	ctx.gui.controller.bot = ctx.gui.folder.crop.add( ctx.ch1.crop, 'bot' );
	ctx.gui.controller.left = ctx.gui.folder.crop.add( ctx.ch1.crop, 'left' );
	ctx.gui.controller.right = ctx.gui.folder.crop.add( ctx.ch1.crop, 'right' );

	ctx.gui.folder.viz.add( ctx.shaders.crop, 'mask' );

	ctx.gui.folder.settings.add( ctx.gui, 'showStats' ).onChange( toggleStats );
	/* Trigger the function to apply the defaults stats value */
	toggleStats();

}

export function updateSlider( folder, control, obj, property, min, max, str ) {

	folder.remove( ctx.gui.controller[ control ] );
	ctx.gui.controller[ control ] =
		folder.add( obj, property, min, max ).name( str );

}

function toggleStats( value ) {

	ctx.stats.dom.style.display = value ? 'block' : 'none';

}

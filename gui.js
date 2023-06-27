import ctx from './state.js';
import { GUI } from 'dat.gui';

export function init_gui() {

	ctx.gui.handle = new GUI();
	ctx.gui.folder.crop = ctx.gui.handle.addFolder( 'Crop' );
	ctx.gui.folder.camera = ctx.gui.handle.addFolder( 'Camera' );
	ctx.gui.folder.settings = ctx.gui.handle.addFolder( 'Settings' );

	ctx.gui.folder.crop.add( ctx.ch1.crop, 'top', 0, 1000 );
	ctx.gui.folder.crop.add( ctx.ch1.crop, 'bot', 0, 1000 );
	ctx.gui.folder.crop.add( ctx.ch1.crop, 'left', 0, 1000 );
	ctx.gui.folder.crop.add( ctx.ch1.crop, 'right', 0, 1000 );

}

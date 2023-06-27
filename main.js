import * as webglUtils from 'webgl-utils.js';
import ctx from './state.js';
import Stats from 'stats.js';
import { GUI } from 'dat.gui';

const canvas = document.querySelector( "canvas" );
const gl = canvas.getContext( "webgl" );

function main() {

	if ( gl )
		console.log(
			"WebGL Version: " + gl.getParameter( gl.VERSION ) + '\n' +
			"Vendor: " + gl.getParameter( gl.VENDOR ) + '\n' +
			"Renderer: " + gl.getParameter( gl.RENDERER ) + '\n' +
			"GLSL Version: " + gl.getParameter( gl.SHADING_LANGUAGE_VERSION )
			 + '\n' +
			"Max tex-size: " + gl.getParameter( gl.MAX_TEXTURE_SIZE ) + "px²" );
	else {

		console.error( "No WebGl context received." );
		return;

	}

	init();
	console.log( ctx );
	requestAnimationFrame( animate );

}

function loadTextFile( url ) {

	return fetch( url ).then( response => response.text() );

}

function init() {

	init_shaders();

	gl.clearColor( 0, 0, 0, 1 );
	/* Prevents headaches when loading NPOT textures */
	gl.pixelStorei( gl.UNPACK_ALIGNMENT, 1 );

}

const stats = new Stats();
document.body.appendChild( stats.dom );

const gui = new GUI();
const cropFolder = gui.addFolder( 'Crop' );
cropFolder.open();
const cameraFolder = gui.addFolder( 'Camera' );
cameraFolder.open();
const settingsFolder = gui.addFolder( 'Settings' );
settingsFolder.open();

function animate() {

	webglUtils.resizeCanvasToDisplaySize( canvas, window.devicePixelRatio );

	render();

	stats.update();

}

main();

function render() {

}

async function init_shaders() {

	/* Compile shaders */
	const paths = [
		'./shd/border.vs',
		'./shd/border.fs',
		'./shd/crop.vs',
		'./shd/crop.fs',
		'./shd/project.vs',
		'./shd/project.fs'
	];

	const files = await Promise.all( paths.map( loadTextFile ) );
	ctx.shaders.border.handle = webglUtils.createProgramFromSources( gl,
		[ files[ 0 ], files[ 1 ] ] );
	ctx.shaders.crop.handle = webglUtils.createProgramFromSources( gl,
		[ files[ 2 ], files[ 3 ] ] );
	ctx.shaders.project.handle = webglUtils.createProgramFromSources( gl,
		[ files[ 4 ], files[ 5 ] ] );

	const unitquadtex = new Float32Array( [
		- 1.0, 1.0, 0.0, 0.0,
		1.0, 1.0, 1.0, 0.0,
		1.0, - 1.0, 1.0, 1.0,
		- 1.0, - 1.0, 0.0, 1.0
	] );

	const unitquad_small = new Float32Array( [
		- 1.0, 1.0,
		1.0, 1.0,
		1.0, - 1.0,
		- 1.0, - 1.0
	] );

	ctx.shaders.border = {
		vtx: gl.getAttribLocation( ctx.shaders.border.handle, "vtx" ),
		scale: gl.getUniformLocation( ctx.shaders.border.handle, "scale" ),
		transform: gl.getUniformLocation( ctx.shaders.border.handle, "transform" ),
		color: gl.getUniformLocation( ctx.shaders.border.handle, "color" ),
		quadvbo: createBufferWithData( gl, unitquad_small )
	};

	ctx.shaders.crop = {
		vtx: gl.getAttribLocation( ctx.shaders.crop.handle, "vtx" ),
		coord: gl.getAttribLocation( ctx.shaders.crop.handle, "coord" ),
		aspect_w: gl.getUniformLocation( ctx.shaders.crop.handle, "aspect_w" ),
		aspect_h: gl.getUniformLocation( ctx.shaders.crop.handle, "aspect_h" ),
		crop: gl.getUniformLocation( ctx.shaders.crop.handle, "crop" ),
		mask_toggle: gl.getUniformLocation( ctx.shaders.crop.handle, "mask_toggle" )
	};

	ctx.shaders.project = {
		pos: gl.getAttribLocation( ctx.shaders.project.handle, "pos" ),
		viewray: gl.getAttribLocation( ctx.shaders.project.handle, "rayvtx" ),
		scaler: gl.getUniformLocation( ctx.shaders.project.handle, "scalar" ),
		crop: gl.getUniformLocation( ctx.shaders.project.handle, "crop" ),
		bgvbo: createBufferWithData( gl, unitquadtex ),
		rayvbo: gl.createBuffer()
	};

}

function createBufferWithData( gl, data ) {

	let buffer = gl.createBuffer();
	gl.bindBuffer( gl.ARRAY_BUFFER, buffer );
	gl.bufferData( gl.ARRAY_BUFFER, data, gl.STATIC_DRAW );
	gl.bindBuffer( gl.ARRAY_BUFFER, null );
	return buffer;

}

init_shaders();

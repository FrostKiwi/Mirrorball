import * as webglUtils from 'webgl-utils.js';
import ctx from './state.js';
import Stats from 'stats.js';
import { GUI } from 'dat.gui';

const canvas = document.querySelector( "canvas" );
const gl = canvas.getContext( "webgl" );

async function main() {

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

	await init();
	requestAnimationFrame( animate );

}

function loadTextFile( url ) {

	return fetch( url ).then( response => response.text() );

}

async function init() {

	await init_shaders();

	gl.clearColor( 0, 0, 0, 1 );
	/* Prevents headaches when loading NPOT textures */
	gl.pixelStorei( gl.UNPACK_ALIGNMENT, 1 );
	load_from_url( "img/room.jpg" );

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

	requestAnimationFrame( animate );
	webglUtils.resizeCanvasToDisplaySize( canvas, window.devicePixelRatio );

	render();

	stats.update();

}

main();

function render() {

	gl.clear( gl.COLOR_BUFFER_BIT );
	gl.viewport( 0, 0, canvas.width, canvas.height );

	gl.useProgram( ctx.shaders.crop.handle );

	gl.bindBuffer( gl.ARRAY_BUFFER, ctx.shaders.crop.bgvbo );
	gl.enableVertexAttribArray( ctx.shaders.crop.vtx );
	gl.enableVertexAttribArray( ctx.shaders.crop.coord );
	gl.vertexAttribPointer( ctx.shaders.crop.vtx, 2, gl.FLOAT, false,
		4 * Float32Array.BYTES_PER_ELEMENT, 0 );
	gl.vertexAttribPointer( ctx.shaders.crop.coord, 2, gl.FLOAT, false,
		4 * Float32Array.BYTES_PER_ELEMENT,
		2 * Float32Array.BYTES_PER_ELEMENT );

	gl.drawArrays( gl.TRIANGLE_FAN, 0, 4 );

}

async function init_shaders() {

	/* Compile shaders */
	const paths = [
		'shd/border.vs',
		'shd/border.fs',
		'shd/crop.vs',
		'shd/crop.fs',
		'shd/project.vs',
		'shd/project.fs'
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
		handle: ctx.shaders.crop.handle,
		vtx: gl.getAttribLocation( ctx.shaders.crop.handle, "vtx" ),
		coord: gl.getAttribLocation( ctx.shaders.crop.handle, "coord" ),
		aspect_w: gl.getUniformLocation( ctx.shaders.crop.handle, "aspect_w" ),
		aspect_h: gl.getUniformLocation( ctx.shaders.crop.handle, "aspect_h" ),
		crop: gl.getUniformLocation( ctx.shaders.crop.handle, "crop" ),
		mask_toggle: gl.getUniformLocation( ctx.shaders.crop.handle, "mask_toggle" ),
		bgvbo: createBufferWithData( gl, unitquadtex )
	};

	ctx.shaders.project = {
		pos: gl.getAttribLocation( ctx.shaders.project.handle, "pos" ),
		viewray: gl.getAttribLocation( ctx.shaders.project.handle, "rayvtx" ),
		scaler: gl.getUniformLocation( ctx.shaders.project.handle, "scalar" ),
		crop: gl.getUniformLocation( ctx.shaders.project.handle, "crop" ),
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

async function load_from_url( url ) {

	try {

		const response = await fetch( url );
		const blob = await response.blob();
		const bitmap = await createImageBitmap( blob );
		media_setup( bitmap );

	} catch ( err ) {

		console.error( err );

	}

}

function media_setup( bitmap ) {

	gl.deleteTexture( ctx.ch1.tex );
	ctx.ch1.tex = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, ctx.ch1.tex );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

	ctx.ch1.w = bitmap.width;
	ctx.ch1.h = bitmap.height;
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, bitmap );
	bitmap.close();

}

import * as webglUtils from 'webgl-utils.js';
import * as glm from 'gl-matrix';
import ctx from './state.js';
import { init_gui, updateSlider } from './gui.js';

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

	init_gui();
	await init_shaders();
	/* Add the stats */
	document.body.appendChild( ctx.stats.dom );

	gl.clearColor( 0, 0, 0, 1 );
	/* Prevents headaches when loading NPOT textures */
	gl.pixelStorei( gl.UNPACK_ALIGNMENT, 1 );

	load_from_url( "img/room.jpg" );
	ctx.ch1.crop.top = 46;
	ctx.ch1.crop.bot = 62;
	ctx.ch1.crop.left = 45;
	ctx.ch1.crop.right = 63;

}

function animate() {

	requestAnimationFrame( animate );
	resizeCanvasToDisplaySize( canvas );

	render();

	ctx.stats.update();

}

function render() {

	gl.clear( gl.COLOR_BUFFER_BIT );
	gl.viewport( 0, 0, canvas.width, canvas.height );

	/* Crop Shader */
	const postcrop_w =
		ctx.ch1.w - ( ctx.ch1.crop.left + ctx.ch1.crop.right );
	const postcrop_h =
	ctx.ch1.h - ( ctx.ch1.crop.top + ctx.ch1.crop.bot );
	const crop = glm.vec4.create();
	crop[ 0 ] = ( 1.0 / ctx.ch1.w ) * ctx.ch1.crop.left;
	crop[ 1 ] = ( 1.0 / ctx.ch1.h ) * ctx.ch1.crop.top;
	crop[ 2 ] = ( 1.0 / ctx.ch1.w ) * postcrop_w;
	crop[ 3 ] = ( 1.0 / ctx.ch1.h ) * postcrop_h;

	gl.useProgram( ctx.shaders.crop.handle );

	gl.uniform4fv( ctx.shaders.crop.crop, crop );
	gl.uniform1i( ctx.shaders.crop.mask_toggle, ctx.shaders.crop.mask );

	if ( postcrop_h / postcrop_w > canvas.height / canvas.width ) {

		gl.uniform1f( ctx.shaders.crop.aspect_h, 1.0 );
		gl.uniform1f(
			ctx.shaders.crop.aspect_w,
			( postcrop_w / postcrop_h ) / ( canvas.width / canvas.height ) );

	} else {

		gl.uniform1f( ctx.shaders.crop.aspect_h,
			( postcrop_h / postcrop_w ) / ( canvas.height / canvas.width ) );
		gl.uniform1f( ctx.shaders.crop.aspect_w, 1.0 );

	}

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

	Object.assign( ctx.shaders.crop, {
		vtx: gl.getAttribLocation( ctx.shaders.crop.handle, "vtx" ),
		coord: gl.getAttribLocation( ctx.shaders.crop.handle, "coord" ),
		aspect_w: gl.getUniformLocation( ctx.shaders.crop.handle, "aspect_w" ),
		aspect_h: gl.getUniformLocation( ctx.shaders.crop.handle, "aspect_h" ),
		crop: gl.getUniformLocation( ctx.shaders.crop.handle, "crop" ),
		mask_toggle: gl.getUniformLocation( ctx.shaders.crop.handle, "mask_toggle" ),
		bgvbo: createBufferWithData( gl, unitquadtex )
	} );

	Object.assign( ctx.shaders.border, {
		vtx: gl.getAttribLocation( ctx.shaders.border.handle, "vtx" ),
		scale: gl.getUniformLocation( ctx.shaders.border.handle, "scale" ),
		transform: gl.getUniformLocation( ctx.shaders.border.handle, "transform" ),
		color: gl.getUniformLocation( ctx.shaders.border.handle, "color" ),
		quadvbo: createBufferWithData( gl, unitquad_small )
	} );

	Object.assign( ctx.shaders.project, {
		pos: gl.getAttribLocation( ctx.shaders.project.handle, "pos" ),
		viewray: gl.getAttribLocation( ctx.shaders.project.handle, "rayvtx" ),
		scaler: gl.getUniformLocation( ctx.shaders.project.handle, "scalar" ),
		crop: gl.getUniformLocation( ctx.shaders.project.handle, "crop" ),
		rayvbo: gl.createBuffer()
	} );

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

	updateSlider( ctx.gui.folder.crop,
		'left', ctx.ch1.crop, 'left', 0, bitmap.width / 2, "Left (Pixels)" );
	updateSlider( ctx.gui.folder.crop,
		'right', ctx.ch1.crop, 'right', 0, bitmap.width / 2, "Right (Pixels)" );
	updateSlider( ctx.gui.folder.crop,
		'top', ctx.ch1.crop, 'top', 0, bitmap.height / 2, "Top (Pixels)" );
	updateSlider( ctx.gui.folder.crop,
		'bot', ctx.ch1.crop, 'bot', 0, bitmap.height / 2, "Bottom (Pixels)" );

	gl.deleteTexture( ctx.ch1.tex );
	ctx.ch1.tex = gl.createTexture();
	gl.bindTexture( gl.TEXTURE_2D, ctx.ch1.tex );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR );
	gl.texParameteri( gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR );

	ctx.ch1.w = bitmap.width;
	ctx.ch1.h = bitmap.height;
	gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE,
		bitmap );
	bitmap.close();

}

const canvasToDisplaySizeMap = new Map( [[ canvas, [ 300, 150 ]]] );

function onResize( entries ) {

	for ( const entry of entries ) {

		let width;
		let height;
		let dpr = window.devicePixelRatio;
		if ( entry.devicePixelContentBoxSize ) {

			// NOTE: Only this path gives the correct answer
			// The other 2 paths are an imperfect fallback
			// for browsers that don't provide anyway to do this
			width = entry.devicePixelContentBoxSize[ 0 ].inlineSize;
			height = entry.devicePixelContentBoxSize[ 0 ].blockSize;
			dpr = 1; // it's already in width and height

		} else if ( entry.contentBoxSize ) {

			if ( entry.contentBoxSize[ 0 ] ) {

				width = entry.contentBoxSize[ 0 ].inlineSize;
				height = entry.contentBoxSize[ 0 ].blockSize;

			} else {

				// legacy
				width = entry.contentBoxSize.inlineSize;
				height = entry.contentBoxSize.blockSize;

			}

		} else {

			// legacy
			width = entry.contentRect.width;
			height = entry.contentRect.height;

		}

		const displayWidth = Math.round( width * dpr );
		const displayHeight = Math.round( height * dpr );
		canvasToDisplaySizeMap.set( entry.target,
			[ displayWidth, displayHeight ] );

	}

}

const resizeObserver = new ResizeObserver( onResize );
resizeObserver.observe( canvas, { box: 'content-box' } );

function resizeCanvasToDisplaySize( canvas ) {

	// Get the size the browser is displaying the canvas in device pixels.
	const [ displayWidth, displayHeight ] =
		canvasToDisplaySizeMap.get( canvas );

	// Check if the canvas is not the same size.
	const needResize = canvas.width !== displayWidth ||
                       canvas.height !== displayHeight;

	if ( needResize ) {

		// Make the canvas the same size
		canvas.width = displayWidth;
		canvas.height = displayHeight;

	}

	return needResize;

}

main();

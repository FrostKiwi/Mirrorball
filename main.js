import * as THREE from 'three';
import Stats from 'stats.js';
import { GUI } from 'dat.gui';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75, 2, 0.1, 1000
);

const renderer = new THREE.WebGLRenderer( { canvas: document.querySelector( "canvas" ) } );

const stats = new Stats();
document.body.appendChild( stats.dom );

camera.position.set( 0, 0, 0 );

const gui = new GUI();
const cropFolder = gui.addFolder( 'Crop' );
cropFolder.open();
const cameraFolder = gui.addFolder( 'Camera' );
cameraFolder.open();
const settingsFolder = gui.addFolder( 'Settings' );
settingsFolder.open();

const showStats = { show: true };
settingsFolder.add( showStats, 'show' ).onChange( function ( value ) {

	stats.dom.style.display = value ? 'block' : 'none';

} );



function resizeCanvasToDisplaySize() {

	const canvas = renderer.domElement;
	const width = canvas.clientWidth;
	const height = canvas.clientHeight;

	if ( canvas.width !== width || canvas.height !== height ) {

		renderer.setSize( width, height, false );
		camera.aspect = width / height;
		camera.updateProjectionMatrix();

	}

}

function animate() {

	resizeCanvasToDisplaySize();
	requestAnimationFrame( animate );

	render();

	stats.update();

}

requestAnimationFrame( animate );

function render() {

	renderer.render( scene, camera );

}

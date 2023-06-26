import * as THREE from 'three';
import Stats from 'stats.js';
import { GUI } from 'dat.gui';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
	75, window.innerWidth / window.innerHeight, 0.1, 1000
);

window.addEventListener( 'resize', onWindowResize, false );

const renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

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

function animate() {

	requestAnimationFrame( animate );

	render();

	stats.update();

}

animate();

function render() {

	renderer.render( scene, camera );

}

function onWindowResize() {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize( window.innerWidth, window.innerHeight );

}

import * as glm from 'gl-matrix';
import Stats from 'stats.js';

const ctx = {
	canvas: null,
	gl: null,
	stats: new Stats(),
	canvasToDisplaySizeMap: null,
	shaders: {
		border: {
			handle: null
		},
		crop: {
			handle: null,
			mask: false
		},
		project: {
			handle: null
		}
	},
	ch1: {
		tex: null,
		w: 0,
		h: 0,
		fov_deg: 360,
		crop: {
			top: 0,
			bot: 0,
			left: 0,
			right: 0
		},
		rot_deg: glm.vec3.create()
	},
	gui: {
		handle: null,
		menu: toggleMenu,
		controller: {},
		crop: true,
		crop_negative: false,
		project: false,
		viz: false,
		viz_subdiv: 16,
		folder: {
			viz: null,
			crop: null,
			world: null,
			camera: null,
			settings: null
		},
		showStats: false
	},
	cam: {
		rot_deg: glm.vec3.create(),
		fov: {
			min: 10,
			max: 140,
			cur: 100
		},
		viewrays: new Float32Array([
			- 1.0, 1.0, 0.0, 0.0, 0.0,
			1.0, 1.0, 0.0, 0.0, 0.0,
			1.0, -1.0, 0.0, 0.0, 0.0,
			-1.0, -1.0, 0.0, 0.0, 0.0
		])
	},
	dom: {
		menu: document.getElementById('menu'),
		spinner: document.getElementById('spinner'),
		statusMSG: document.getElementById('statusMSG'),
		filesize: document.getElementById('filesize')
	}
};

export default ctx;

function toggleMenu() {
	if (ctx.dom.menu.style.display === 'none')
		ctx.dom.menu.style.display = 'block';
	else
		ctx.dom.menu.style.display = 'none';
}
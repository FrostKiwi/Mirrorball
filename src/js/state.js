import * as glm from 'gl-matrix';
import Stats from 'stats.js';

const ctx = {
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
		rot: glm.vec3.create()
	},
	gui: {
		handle: null,
		menu: toggleMenu,
		controller: {},
		crop: true,
		project: false,
		folder: {
			viz: null,
			crop: null,
			camera: null,
			settings: null
		},
		showStats: false
	},
	cam: {
		rot: glm.vec3.create(),
		fov: {
			min: glm.glMatrix.toRadian(10),
			max: glm.glMatrix.toRadian(140),
			cur: glm.glMatrix.toRadian(100)
		}
	}
};

export default ctx;

function toggleMenu() {
	var menu = document.querySelector('.menu');
	if (menu.style.display === 'none') {
		menu.style.display = 'block';
	} else {
		menu.style.display = 'none';
	}
}
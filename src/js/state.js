import * as glm from 'gl-matrix';
import Stats from 'stats.js';

export const ctx = {
	canvas: null,
	gl: null,
	stats: new Stats(),
	redraw: false,
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
		fullscreen: toggle_fullscreen,
		controller: {},
		crop: true,
		project: true,
		crop_negative: false,
		viz: false,
		viz_subdiv: 16,
		folder: {
			viz: null,
			crop: null,
			world: null,
			setup: null,
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

function toggleMenu() {
	if (ctx.dom.menu.style.display === 'none')
		ctx.dom.menu.style.display = 'block';
	else
		ctx.dom.menu.style.display = 'none';
}

function toggle_fullscreen() {
	if (document.fullscreenElement || document.webkitFullscreenElement) {
		if (document.exitFullscreen)
			document.exitFullscreen();
		else if (document.webkitExitFullscreen)
			document.webkitExitFullscreen();
	} else {
		const elem = document.documentElement;
		if (elem.requestFullscreen)
			elem.requestFullscreen();
		else if (elem.webkitRequestFullscreen)
			elem.webkitRequestFullscreen();
	}
}

let prev = {
	shaders: {
		crop: {
			mask: false
		}
	},
	ch1: {
		w: null,
		h: null,
		fov_deg: null,
		crop: {
			top: null,
			bot: null,
			left: null,
			right: null
		},
		rot_deg: glm.vec3.create()
	},
	gui: {
		crop: null,
		project: null,
		viz: null,
		viz_subdiv: null
	},
	cam: {
		rot_deg: glm.vec3.create(),
		fov: {
			min: null,
			max: null,
			cur: null
		}
	}
}

export function redraw() {
	if (prev.shaders.crop.mask !== ctx.shaders.crop.mask) {
		prev.shaders.crop.mask = ctx.shaders.crop.mask;
		ctx.redraw = true;
	}
	if (prev.ch1.w !== ctx.ch1.w) {
		prev.ch1.w = ctx.ch1.w;
		ctx.redraw = true;
	}
	if (prev.ch1.h !== ctx.ch1.h) {
		prev.ch1.h = ctx.ch1.h;
		ctx.redraw = true;
	}
	if (prev.ch1.fov_deg !== ctx.ch1.fov_deg) {
		prev.ch1.fov_deg = ctx.ch1.fov_deg;
		ctx.redraw = true;
	}
	if (prev.ch1.crop.top !== ctx.ch1.crop.top) {
		prev.ch1.crop.top = ctx.ch1.crop.top;
		ctx.redraw = true;
	}
	if (prev.ch1.crop.bot !== ctx.ch1.crop.bot) {
		prev.ch1.crop.bot = ctx.ch1.crop.bot;
		ctx.redraw = true;
	}
	if (prev.ch1.crop.left !== ctx.ch1.crop.left) {
		prev.ch1.crop.left = ctx.ch1.crop.left;
		ctx.redraw = true;
	}
	if (prev.ch1.crop.right !== ctx.ch1.crop.right) {
		prev.ch1.crop.right = ctx.ch1.crop.right;
		ctx.redraw = true;
	}
	if (!glm.vec3.equals(prev.ch1.rot_deg, ctx.ch1.rot_deg)) {
		glm.vec3.copy(prev.ch1.rot_deg, ctx.ch1.rot_deg);
		ctx.redraw = true;
	}
	if (prev.gui.crop !== ctx.gui.crop) {
		prev.gui.crop = ctx.gui.crop;
		ctx.redraw = true;
	}
	if (prev.gui.project !== ctx.gui.project) {
		prev.gui.project = ctx.gui.project;
		ctx.redraw = true;
	}
	if (prev.gui.viz !== ctx.gui.viz) {
		prev.gui.viz = ctx.gui.viz;
		ctx.redraw = true;
	}
	if (prev.gui.viz_subdiv !== ctx.gui.viz_subdiv) {
		prev.gui.viz_subdiv = ctx.gui.viz_subdiv;
		ctx.redraw = true;
	}
	if (!glm.vec3.equals(prev.cam.rot_deg, ctx.cam.rot_deg)) {
		glm.vec3.copy(prev.cam.rot_deg, ctx.cam.rot_deg);
		ctx.redraw = true;
	}
	if (prev.cam.fov.min !== ctx.cam.fov.min) {
		prev.cam.fov.min = ctx.cam.fov.min;
		ctx.redraw = true;
	}
	if (prev.cam.fov.max !== ctx.cam.fov.max) {
		prev.cam.fov.max = ctx.cam.fov.max;
		ctx.redraw = true;
	}
	if (prev.cam.fov.cur !== ctx.cam.fov.cur) {
		prev.cam.fov.cur = ctx.cam.fov.cur;
		ctx.redraw = true;
	}

	return ctx.redraw;
}
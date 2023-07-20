import * as glm from 'gl-matrix';
import Stats from 'stats.js';

/* State, which does not determine to redraws */
export let ctx = {
	canvas: null,
	gl: null,
	stats: new Stats(),
	stats_events: new Stats(),
	redraw: false,
	continous: false,
	animate: null,
	video: null,
	max_texsize: 0,
	animate_cont: null,
	drawing: false,
	loading: false,
	canvasToDisplaySizeMap: null,
	shaders: {
		ch1: {
			tex: null,
			w: 0,
			h: 0,
		},
		viewrays: new Float32Array([
			- 1.0, 1.0, 0.0, 0.0, 0.0,
			1.0, 1.0, 0.0, 0.0, 0.0,
			1.0, -1.0, 0.0, 0.0, 0.0,
			-1.0, -1.0, 0.0, 0.0, 0.0
		]),
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
	gui: {
		handle: null,
		menu: toggleMenu,
		fullscreen: toggle_fullscreen,
		controller: {},
		crop_negative: false,
		eruda: false,
		folder: {
			viz: null,
			crop: null,
			world: null,
			setup: null,
			debug: null,
			camera: null,
			settings: null
		},
		showStats: false,
		showEventStats: false
	},
	cam: {
		fov: {
			min: 10,
			max: 140
		}
	},
	dom: {
		menu: document.getElementById('menu'),
		spinner: document.getElementById('spinner'),
		statusMSG: document.getElementById('statusMSG'),
		filesize: document.getElementById('filesize')
	}
};

/* State, which results in a redraw upon change */
export let ctr = {
	/* Toggles */
	tog: {
		crop: true,
		project: true,
		viz: false,
		viz_subdiv: 16,
		mask: false
	},
	/* Media channels */
	ch1: {
		fov_deg: 360,
		crop: {
			top: 0,
			bot: 0,
			left: 0,
			right: 0
		},
		rot_deg: glm.vec3.create()
	},
	/* Camera */
	cam: {
		rot_deg: glm.vec3.create(),
		fov: {
			cur: 100
		}
	}
}

/* Ugly copy pasted. Maybe should use structured clone */
let prev = {
	/* Toggles */
	tog: {
		crop: true,
		project: true,
		viz: false,
		viz_subdiv: 16,
		mask: false
	},
	/* Media channels */
	ch1: {
		fov_deg: 360,
		crop: {
			top: 0,
			bot: 0,
			left: 0,
			right: 0
		},
		rot_deg: glm.vec3.create()
	},
	/* Camera */
	cam: {
		rot_deg: glm.vec3.create(),
		fov: {
			cur: 100
		}
	}
}

/* Manual tree of comparison is bad, but works for now. Should maybe do a
   structured clone, but maybe overkill? */
export function redraw() {
	if (!glm.vec3.equals(prev.cam.rot_deg, ctr.cam.rot_deg)) {
		ctx.redraw = true;
		glm.vec3.copy(prev.cam.rot_deg, ctr.cam.rot_deg);
	}
	else if (prev.tog.crop !== ctr.tog.crop) {
		ctx.redraw = true;
		prev.tog.crop = ctr.tog.crop;
	}
	else if (prev.tog.project !== ctr.tog.project) {
		ctx.redraw = true;
		prev.tog.project = ctr.tog.project;
	}
	else if (prev.tog.mask !== ctr.tog.mask) {
		ctx.redraw = true;
		prev.tog.mask = ctr.tog.mask;
	}
	else if (prev.tog.viz !== ctr.tog.viz) {
		ctx.redraw = true;
		prev.tog.viz = ctr.tog.viz;
	}
	else if (prev.ch1.fov_deg !== ctr.ch1.fov_deg) {
		ctx.redraw = true;
		prev.ch1.fov_deg = ctr.ch1.fov_deg;
	}
	else if (prev.ch1.crop.top !== ctr.ch1.crop.top) {
		ctx.redraw = true;
		prev.ch1.crop.top = ctr.ch1.crop.top;
	}
	else if (prev.ch1.crop.bot !== ctr.ch1.crop.bot) {
		ctx.redraw = true;
		prev.ch1.crop.bot = ctr.ch1.crop.bot;
	}
	else if (prev.ch1.crop.left !== ctr.ch1.crop.left) {
		ctx.redraw = true;
		prev.ch1.crop.left = ctr.ch1.crop.left;
	}
	else if (prev.ch1.crop.right !== ctr.ch1.crop.right) {
		ctx.redraw = true;
		prev.ch1.crop.right = ctr.ch1.crop.right;
	}
	else if (!glm.vec3.equals(prev.ch1.rot_deg, ctr.ch1.rot_deg)) {
		ctx.redraw = true;
		glm.vec3.copy(prev.ch1.rot_deg, ctr.ch1.rot_deg);
	}
	else if (prev.tog.viz_subdiv !== ctr.tog.viz_subdiv) {
		ctx.redraw = true;
		prev.tog.viz_subdiv = ctr.tog.viz_subdiv;
	}
	else if (prev.cam.fov.cur !== ctr.cam.fov.cur) {
		ctx.redraw = true;
		prev.cam.fov.cur = ctr.cam.fov.cur;
	}

	if (ctx.redraw)
		requestAnimationFrame(ctx.animate);
}

export function toggleMenu() {
	if (ctx.dom.menu.style.display === 'none')
		ctx.dom.menu.style.display = 'flex';
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
import Stats from 'stats.js';

let ctx = {
	stats: new Stats(),
	shaders: {
		border: {
			handle: null
		},
		crop: {
			handle: null
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
		}
	},
	gui: {
		handle: null,
		folder: {
			crop: null,
			camera: null,
			settings: null
		}
	}
};

export default ctx;

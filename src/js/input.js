import { ctx, ctr, redraw } from './state.js';

let keyState = {};
const usedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW',
	'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'
];

window.addEventListener('keydown', function (e) {
	/* No camera controls, when user interacting with gui */
	if (e.target.tagName.toLowerCase() === 'input') {
		return;
	}

	keyState[e.code] = true;
	if (usedKeys.includes(e.code))
		/* continous redraws, if keys used keys are pressed */
		if (!ctx.continous) {
			ctx.continous = true;
			lastKeyUpdate = 0;
			requestAnimationFrame(ctx.animate_cont);
		}
}, true);

window.addEventListener('keyup', function (e) {
	keyState[e.code] = false;
	if (usedKeys.every(key => !keyState[key]))
		/* Stop continous redraws, if keys are released */
		ctx.continous = false;
}, true);

window.addEventListener('blur', function () {
	for (let key in keyState) {
		keyState[key] = false;
	}
	/* Stop continous redraws, if keys are released */
	ctx.continous = false;
});

let lastKeyUpdate = 0;

function update_degrees() {
	if (ctr.cam.rot_deg[1] > 180) ctr.cam.rot_deg[1] -= 360;
	if (ctr.cam.rot_deg[1] < -180) ctr.cam.rot_deg[1] += 360;
	if (ctr.cam.fov.cur > ctx.cam.fov.max)
		ctr.cam.fov.cur = ctx.cam.fov.max;
	if (ctr.cam.fov.cur < ctx.cam.fov.min)
		ctr.cam.fov.cur = ctx.cam.fov.min;
	if (ctr.cam.rot_deg[0] > 90) ctr.cam.rot_deg[0] = 90;
	if (ctr.cam.rot_deg[0] < -90) ctr.cam.rot_deg[0] = -90;
	ctx.gui.controller.pitch.updateDisplay();
	ctx.gui.controller.yaw.updateDisplay();
	ctx.gui.controller.cam_fov.updateDisplay();
}

/* Keys have to be polled for smooth operation */
export function key_input(time) {
	const rotationSpeed = 0.15;
	const zoomSpeed = 0.2;

	let deltaTime;
	deltaTime = time - lastKeyUpdate;
	if (lastKeyUpdate == 0) deltaTime = 16.6;
	lastKeyUpdate = time;

	let mul = (ctr.cam.fov.cur - ctx.cam.fov.min) /
		(ctx.cam.fov.max - ctx.cam.fov.min) + 0.1;

	if (keyState['ArrowUp'] || keyState['KeyW']) ctr.cam.rot_deg[0] +=
		rotationSpeed * mul * deltaTime;
	if (keyState['ArrowDown'] || keyState['KeyS']) ctr.cam.rot_deg[0] -=
		rotationSpeed * mul * deltaTime;
	if (keyState['ArrowLeft'] || keyState['KeyA']) ctr.cam.rot_deg[1] +=
		rotationSpeed * mul * deltaTime;
	if (keyState['ArrowRight'] || keyState['KeyD']) ctr.cam.rot_deg[1] -=
		rotationSpeed * mul * deltaTime;

	/* Limits */
	if (keyState['KeyE']) ctr.cam.fov.cur -= mul * zoomSpeed * deltaTime;
	if (keyState['KeyQ']) ctr.cam.fov.cur += mul * zoomSpeed * deltaTime;
	update_degrees();
}

export function setup_input() {
	let lastTouch = null;
	let lastMouse = null;
	const mouseSpeed = 0.2;
	const fingerSpeed = 0.4;
	const wheelSpeed = 0.05;

	/* Touch */
	ctx.canvas.addEventListener('touchstart', e => {
		e.preventDefault();
		lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}, { passive: false });

	ctx.canvas.addEventListener('touchmove', e => {
		e.preventDefault();
		let mul = (ctr.cam.fov.cur - ctx.cam.fov.min) /
			(ctx.cam.fov.max - ctx.cam.fov.min) + 0.1;

		/* Not good enough, second touch disables disables camera rotation,
		   needs fixing. */
		if (lastTouch && e.touches.length === 1) {
			const dx = (e.touches[0].clientX - lastTouch.x) * mul * fingerSpeed;
			const dy = (e.touches[0].clientY - lastTouch.y) * mul * fingerSpeed;
			ctr.cam.rot_deg[0] += dy;
			ctr.cam.rot_deg[1] += dx;
			lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
			update_degrees();
			redraw();
		}
		if (lastTouch && e.touches.length === 2) {
			const distance = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			);
			if (lastTouch.distance) {
				const dd = (distance - lastTouch.distance) * mul * fingerSpeed;
				ctr.cam.fov.cur = Math.max(ctx.cam.fov.min,
					Math.min(ctx.cam.fov.max, ctr.cam.fov.cur - dd));
			}
			lastTouch.distance = distance;
			update_degrees();
			redraw();
		}
	}, { passive: false });

	ctx.canvas.addEventListener('touchend', e => {
		e.preventDefault();
		lastTouch = null;
	}, { passive: false });


	/* Mouse */
	ctx.canvas.addEventListener('mousedown', e => {
		lastMouse = { x: e.clientX, y: e.clientY };
	}, false);

	ctx.canvas.addEventListener('mousemove', e => {
		let mul = (ctr.cam.fov.cur - ctx.cam.fov.min) /
			(ctx.cam.fov.max - ctx.cam.fov.min) + 0.1;

		if (lastMouse && e.buttons === 1) {
			const dx = (e.clientX - lastMouse.x) * mul * mouseSpeed;
			const dy = (e.clientY - lastMouse.y) * mul * mouseSpeed;
			ctr.cam.rot_deg[0] += dy;
			ctr.cam.rot_deg[1] += dx;
			lastMouse = { x: e.clientX, y: e.clientY };
			update_degrees();
			redraw();
		}
	}, false);

	ctx.canvas.addEventListener('mouseup', () => {
		lastMouse = null;
	}, false);

	ctx.canvas.addEventListener('wheel', e => {
		let mul = (ctr.cam.fov.cur - ctx.cam.fov.min) /
			(ctx.cam.fov.max - ctx.cam.fov.min) + 0.1;

		const dd = e.deltaY * mul * wheelSpeed;
		ctr.cam.fov.cur = Math.max(ctx.cam.fov.min,
			Math.min(ctx.cam.fov.max, ctr.cam.fov.cur + dd));
		update_degrees();
		redraw();
	}, false);
}
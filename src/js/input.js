import { ctx, redraw } from './state.js';

let keyState = {};
const usedKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'KeyW',
	'KeyA', 'KeyS', 'KeyD', 'KeyQ', 'KeyE'
];

window.addEventListener('keydown', function (e) {
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
	if (ctx.cam.rot_deg[1] > 180) ctx.cam.rot_deg[1] -= 360;
	if (ctx.cam.rot_deg[1] < -180) ctx.cam.rot_deg[1] += 360;
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
	if(lastKeyUpdate == 0) deltaTime = 16.6;
	lastKeyUpdate = time;

	let mul = (ctx.cam.fov.cur - ctx.cam.fov.min) /
		(ctx.cam.fov.max - ctx.cam.fov.min) + 0.1;

	if (keyState['ArrowUp'] || keyState['KeyW']) ctx.cam.rot_deg[0] +=
		rotationSpeed * mul * deltaTime;
	if (keyState['ArrowDown'] || keyState['KeyS']) ctx.cam.rot_deg[0] -=
		rotationSpeed * mul * deltaTime;
	if (keyState['ArrowLeft'] || keyState['KeyA']) ctx.cam.rot_deg[1] +=
		rotationSpeed * mul * deltaTime;
	if (keyState['ArrowRight'] || keyState['KeyD']) ctx.cam.rot_deg[1] -=
		rotationSpeed * mul * deltaTime;

	/* Limits */
	if (keyState['KeyE']) ctx.cam.fov.cur -= mul * zoomSpeed * deltaTime;
	if (keyState['KeyQ']) ctx.cam.fov.cur += mul * zoomSpeed * deltaTime;
	if (ctx.cam.fov.cur > ctx.cam.fov.max)
		ctx.cam.fov.cur = ctx.cam.fov.max;
	if (ctx.cam.fov.cur < ctx.cam.fov.min)
		ctx.cam.fov.cur = ctx.cam.fov.min;
	if (ctx.cam.rot_deg[0] > 90) ctx.cam.rot_deg[0] = 90;
	if (ctx.cam.rot_deg[0] < -90) ctx.cam.rot_deg[0] = -90;
	update_degrees();
}

export function setup_input() {
	let lastTouch = null;
	let lastMouse = null;
	const mouseSpeed = 0.2;
	const fingerSpeed = 0.2;
	const wheelSpeed = 0.05;

	/* Touch */
	ctx.canvas.addEventListener('touchstart', e => {
		e.preventDefault();
		lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}, { passive: false });

	ctx.canvas.addEventListener('touchmove', e => {
		e.preventDefault();
		let mul = (ctx.cam.fov.cur - ctx.cam.fov.min) /
			(ctx.cam.fov.max - ctx.cam.fov.min) + 0.1;

		/* Not good enough, second touch disables disables camera rotation,
		   needs fixing. */
		if (lastTouch && e.touches.length === 1) {
			const dx = (e.touches[0].clientX - lastTouch.x) * mul * fingerSpeed;
			const dy = (e.touches[0].clientY - lastTouch.y) * mul * fingerSpeed;
			ctx.cam.rot_deg[0] += dy;
			ctx.cam.rot_deg[1] += dx;
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
				ctx.cam.fov.cur = Math.max(ctx.cam.fov.min,
					Math.min(ctx.cam.fov.max, ctx.cam.fov.cur - dd));
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
		let mul = (ctx.cam.fov.cur - ctx.cam.fov.min) /
			(ctx.cam.fov.max - ctx.cam.fov.min) + 0.1;

		if (lastMouse && e.buttons === 1) {
			const dx = (e.clientX - lastMouse.x) * mul * mouseSpeed;
			const dy = (e.clientY - lastMouse.y) * mul * mouseSpeed;
			ctx.cam.rot_deg[0] += dy;
			ctx.cam.rot_deg[1] += dx;
			lastMouse = { x: e.clientX, y: e.clientY };
			update_degrees();
			redraw();
		}
	}, false);

	ctx.canvas.addEventListener('mouseup', () => {
		lastMouse = null;
	}, false);

	ctx.canvas.addEventListener('wheel', e => {
		let mul = (ctx.cam.fov.cur - ctx.cam.fov.min) /
			(ctx.cam.fov.max - ctx.cam.fov.min) + 0.1;

		const dd = e.deltaY * mul * wheelSpeed;
		ctx.cam.fov.cur = Math.max(ctx.cam.fov.min,
			Math.min(ctx.cam.fov.max, ctx.cam.fov.cur + dd));
		update_degrees();
		redraw();
	}, false);
}
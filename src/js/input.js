import ctx from './state.js';

let keyState = {};
window.addEventListener('keydown', function (e) {
	keyState[e.code] = true;
}, true);

window.addEventListener('keyup', function (e) {
	keyState[e.code] = false;
}, true);

let lastTime = 0;

export function key_input(time) {
	const rotationSpeed = 0.1;
	const zoomSpeed = 0.05;

	let deltaTime = time - lastTime;
	lastTime = time;

	if (keyState['ArrowUp'] || keyState['KeyW']) ctx.cam.rot_deg[0] +=
		rotationSpeed * deltaTime;
	if (keyState['ArrowDown'] || keyState['KeyS']) ctx.cam.rot_deg[0] -=
		rotationSpeed * deltaTime;
	if (keyState['ArrowLeft'] || keyState['KeyA']) ctx.cam.rot_deg[1] +=
		rotationSpeed * deltaTime;
	if (keyState['ArrowRight'] || keyState['KeyD']) ctx.cam.rot_deg[1] -=
		rotationSpeed * deltaTime;

	/* Limits */
	if (keyState['KeyE']) ctx.cam.fov.cur -= zoomSpeed * deltaTime;
	if (keyState['KeyQ']) ctx.cam.fov.cur += zoomSpeed * deltaTime;
	if (ctx.cam.fov.cur > ctx.cam.fov.max)
		ctx.cam.fov.cur = ctx.cam.fov.max;
	if (ctx.cam.fov.cur < ctx.cam.fov.min)
		ctx.cam.fov.cur = ctx.cam.fov.min;
	if (ctx.cam.rot_deg[0] > 90) ctx.cam.rot_deg[0] = 90;
	if (ctx.cam.rot_deg[0] < -90) ctx.cam.rot_deg[0] = -90;
}

export function setup_input() {
	let lastTouch = null;
	let lastMouse = null;
	const rotateSpeed = 0.2;
	const zoomSpeed = 0.1;

	/* Touch */
	ctx.canvas.addEventListener('touchstart', e => {
		lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}, false);

	ctx.canvas.addEventListener('touchmove', e => {
		if (lastTouch && e.touches.length === 1) {
			const dx = (e.touches[0].clientX - lastTouch.x) * rotateSpeed;
			const dy = (e.touches[0].clientY - lastTouch.y) * rotateSpeed;
			ctx.cam.rot_deg[0] += dy;
			ctx.cam.rot_deg[1] += dx;
			lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
		} else if (lastTouch && e.touches.length === 2) {
			const distance = Math.hypot(
				e.touches[0].clientX - e.touches[1].clientX,
				e.touches[0].clientY - e.touches[1].clientY
			);
			if (lastTouch.distance) {
				const dd = (distance - lastTouch.distance) * zoomSpeed;
				ctx.cam.fov.cur = Math.max(ctx.cam.fov.min,
					Math.min(ctx.cam.fov.max, ctx.cam.fov.cur - dd));
			}
			lastTouch.distance = distance;
		}
	}, false);

	ctx.canvas.addEventListener('touchend', () => {
		lastTouch = null;
	}, false);

	/* Mouse */
	ctx.canvas.addEventListener('mousedown', e => {
		lastMouse = { x: e.clientX, y: e.clientY };
	}, false);

	ctx.canvas.addEventListener('mousemove', e => {
		if (lastMouse && e.buttons === 1) {
			const dx = (e.clientX - lastMouse.x) * rotateSpeed;
			const dy = (e.clientY - lastMouse.y) * rotateSpeed;
			ctx.cam.rot_deg[0] += dy;
			ctx.cam.rot_deg[1] += dx;
			lastMouse = { x: e.clientX, y: e.clientY };
		}
	}, false);

	ctx.canvas.addEventListener('mouseup', () => {
		lastMouse = null;
	}, false);

	ctx.canvas.addEventListener('wheel', e => {
		const dd = e.deltaY * zoomSpeed;
		ctx.cam.fov.cur = Math.max(ctx.cam.fov.min,
			Math.min(ctx.cam.fov.max, ctx.cam.fov.cur + dd));
	}, false);
}
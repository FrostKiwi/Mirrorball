import { ctx, ctr, redraw, enableMapping } from './state.js';

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
		if (!ctx.continous && !ctx.playing && !ctx.controller) {
			ctx.continous = true;
			/* Technically, 'last' variable is needed */
			ctx.lastKeyUpdate = 0;
			ctx.lastControllerUpdate = 0;
			requestAnimationFrame(ctx.animate_cont);
		}
}, true);

window.addEventListener('keyup', function (e) {
	keyState[e.code] = false;
	if (usedKeys.every(key => !keyState[key]))
		/* Stop continous redraws, if keys are released */
		if (ctx.continous && !ctx.playing && !ctx.controller)
			ctx.continous = false;
}, true);

window.addEventListener('blur', function () {
	for (let key in keyState) {
		keyState[key] = false;
	}
	/* Stop continous redraws, if keys are released */
	if (ctx.continous && !ctx.playing && !ctx.controller)
		ctx.continous = false;
});

function update_degrees() {
	/* Limits */
	if (ctr.cam.rot_deg[1] > 180) ctr.cam.rot_deg[1] -= 360;
	if (ctr.cam.rot_deg[1] < -180) ctr.cam.rot_deg[1] += 360;
	if (ctr.cam.fov.cur > ctx.cam.fov.max)
		ctr.cam.fov.cur = ctx.cam.fov.max;
	if (ctr.cam.fov.cur < ctx.cam.fov.min)
		ctr.cam.fov.cur = ctx.cam.fov.min;
	if (ctr.cam.rot_deg[0] > 90) ctr.cam.rot_deg[0] = 90;
	if (ctr.cam.rot_deg[0] < -90) ctr.cam.rot_deg[0] = -90;

	/* Make sure the GUI responds */
	ctx.gui.controller.cam_pitch.updateDisplay();
	ctx.gui.controller.cam_yaw.updateDisplay();
	ctx.gui.controller.cam_fov.updateDisplay();
}

/* Keys have to be polled for smooth operation */
export function key_input(time) {
	const rotationSpeed = 0.15;
	const zoomSpeed = 0.2;

	let deltaTime;
	deltaTime = time - ctx.lastKeyUpdate;
	if (ctx.lastKeyUpdate == 0) deltaTime = 16.6;
	ctx.lastKeyUpdate = time;

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

	if (keyState['KeyE']) ctr.cam.fov.cur -= mul * zoomSpeed * deltaTime;
	if (keyState['KeyQ']) ctr.cam.fov.cur += mul * zoomSpeed * deltaTime;
	update_degrees();
}

export function controller_input(time) {
	const gamepads = navigator.getGamepads();

	if (gamepads[ctx.gui.gamepad - 1]) {
		const gp = gamepads[ctx.gui.gamepad - 1];


		for (let i = 0; i < gp.buttons.length; i++) {
			if (gp.buttons[i].pressed) {
				console.log(`Mapped ??? to button ${i}`);
				return;
			}
		}
		for (let i = 0; i < gp.axes.length; i++) {
			if (Math.abs(gp.axes[i]) > 0.5) {  // If any axis is moved significantly
				console.log(`Mapped ??? to axis ${i}`);
				return;
			}
		}

		const rotationSpeed = 0.25;
		const zoomSpeed = 0.125;

		let deltaTime;
		deltaTime = time - ctx.lastControllerUpdate;
		if (ctx.lastControllerUpdate == 0) deltaTime = 16.6;
		ctx.lastControllerUpdate = time;

		let mul = (ctr.cam.fov.cur - ctx.cam.fov.min) /
			(ctx.cam.fov.max - ctx.cam.fov.min) + 0.1;

		/* Source Mix via D-Pad Left-Right */
		if (gp.buttons[14] && gp.buttons[14].pressed) {
			ctr.ch2.alpha -= 0.01;
			if (ctr.ch2.alpha < 0)
				ctr.ch2.alpha = 0;
			ctx.gui.controller.alpha.updateDisplay();
		}
		if (gp.buttons[15] && gp.buttons[15].pressed) {
			ctr.ch2.alpha += 0.01;
			if (ctr.ch2.alpha > 1)
				ctr.ch2.alpha = 1;
			ctx.gui.controller.alpha.updateDisplay();
		}

		/* Get exponential scaling gamepad curve via the axes' magnitude, so the
		   pow operator doesn't restrict diagonal movement. */
		const exp_scale =
			Math.pow(
				Math.sqrt(gp.axes[0] * gp.axes[0] + gp.axes[1] * gp.axes[1]),
				3);

		if (Math.abs(gp.axes[1]) > ctx.gui.deadzone)
			ctr.cam.rot_deg[0] -=
				gp.axes[1] * exp_scale * rotationSpeed * mul * deltaTime;

		if (Math.abs(gp.axes[0]) > ctx.gui.deadzone)
			ctr.cam.rot_deg[1] -=
				gp.axes[0] * exp_scale * rotationSpeed * mul * deltaTime;

		if (Math.abs(gp.axes[3]) > ctx.gui.deadzone)
			ctr.cam.fov.cur +=
				gp.axes[3] * Math.pow(gp.axes[3], 4) * zoomSpeed * mul *
				deltaTime;

		update_degrees();
	}
}

export function setup_input() {
	let lastTouch = null;
	let lastMouse = null;
	const mouseSpeed = 0.2;
	const fingerSpeed = 0.4;
	const wheelSpeed = 0.05;

	/* Set controller to enable continous mode */
	window.addEventListener("gamepadconnected", (e) => {
		enableMapping();
		if (!ctx.continous && !ctx.playing && !ctx.controller) {
			ctx.controller = true;
			ctx.continous = true;
			/* Technically, 'last' variable is needed */
			ctx.lastKeyUpdate = 0;
			ctx.lastControllerUpdate = 0;
			requestAnimationFrame(ctx.animate_cont);
		} else {
			ctx.controller = true;
		}
	});

	document.getElementById('camX').addEventListener('click',
		function (event) {
			console.log("Function for Mapping Yaw ");
		}
	);

	document.getElementById('camY').addEventListener('click',
		function (event) {
			console.log("Function for Mapping Pitch ");
		}
	);

	document.getElementById('zoom').addEventListener('click',
		function (event) {
			console.log("Function for Mapping Zoom ");
		}
	);

	document.getElementById('mix').addEventListener('click',
		function (event) {
			console.log("Function for Mapping Mix ");
		}
	);

	window.addEventListener("gamepaddisconnected", (e) => {
		ctx.controller = false;
	});

	/* Touch */
	ctx.canvas.addEventListener('touchstart', e => {
		e.preventDefault();
		lastTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
	}, { passive: false });

	ctx.canvas.addEventListener('touchmove', e => {
		e.preventDefault();
		let mul = (ctr.cam.fov.cur - ctx.cam.fov.min) /
			(ctx.cam.fov.max - ctx.cam.fov.min) + 0.1;

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
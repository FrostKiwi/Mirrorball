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

const mapControlToFunction = (type, index) => {
	switch (ctx.gamepad.currentMappingFunction) {
		case 'yaw':
			if (type === 'axis') {
				ctx.gamepad.yaw_axis = index;
				ctx.gamepad.yaw_btn_inc = null;
				ctx.gamepad.yaw_btn_dec = null;
				document.getElementById('camX_mapping').innerText = `axis ${index}`;
				endMappingMode();
			} else {
				if (ctx.gamepad.yaw_btn_inc == null) {
					ctx.gamepad.yaw_axis = null;
					ctx.gamepad.yaw_btn_inc = index;
					ctx.gamepad.yaw_btn_dec = null;
					document.getElementById('camX_mapping').innerText = `Button ${index} / -`;
				}
				if (ctx.gamepad.yaw_btn_inc && index != ctx.gamepad.yaw_btn_inc) {
					ctx.gamepad.yaw_btn_dec = index;
					document.getElementById('camX_mapping').innerText =
						`Button ${ctx.gamepad.yaw_btn_inc} / ${index}`;
					endMappingMode();
				}
			}
			break;
		case 'pitch':
			if (type === 'axis') {
				ctx.gamepad.pitch_axis = index;
				ctx.gamepad.pitch_btn_inc = null;
				ctx.gamepad.pitch_btn_dec = null;
				document.getElementById('camY_mapping').innerText = `axis ${index}`;
				endMappingMode();
			} else {
				if (ctx.gamepad.pitch_btn_inc == null) {
					ctx.gamepad.pitch_axis = null;
					ctx.gamepad.pitch_btn_inc = index;
					ctx.gamepad.pitch_btn_dec = null;
					document.getElementById('camY_mapping').innerText = `Button ${index} / -`;
				}
				if (ctx.gamepad.pitch_btn_inc && index != ctx.gamepad.pitch_btn_inc) {
					ctx.gamepad.pitch_btn_dec = index;
					document.getElementById('camY_mapping').innerText =
						`Button ${ctx.gamepad.pitch_btn_inc} / ${index}`;
					endMappingMode();
				}
			}
			break;
		case 'zoom':
			if (type === 'axis') {
				ctx.gamepad.zoom_axis = index;
				ctx.gamepad.zoom_btn_inc = null;
				ctx.gamepad.zoom_btn_dec = null;
				document.getElementById('zoom_mapping').innerText = `axis ${index}`;
				endMappingMode();
			} else {
				if (ctx.gamepad.zoom_btn_inc == null) {
					ctx.gamepad.zoom_axis = null;
					ctx.gamepad.zoom_btn_inc = index;
					ctx.gamepad.zoom_btn_dec = null;
					document.getElementById('zoom_mapping').innerText = `Button ${index} / -`;
				}
				if (ctx.gamepad.zoom_btn_inc && index != ctx.gamepad.zoom_btn_inc) {
					ctx.gamepad.zoom_btn_dec = index;
					document.getElementById('zoom_mapping').innerText =
						`Button ${ctx.gamepad.zoom_btn_inc} / ${index}`;
					endMappingMode();
				}
			}
			break;
		case 'mix':
			if (type === 'axis') {
				ctx.gamepad.mix_axis = index;
				ctx.gamepad.mix_btn_inc = null;
				ctx.gamepad.mix_btn_dec = null;
				document.getElementById('mix_mapping').innerText = `axis ${index}`;
				endMappingMode();
			} else {
				if (ctx.gamepad.mix_btn_inc == null) {
					ctx.gamepad.mix_axis = null;
					ctx.gamepad.mix_btn_inc = index;
					ctx.gamepad.mix_btn_dec = null;
					document.getElementById('mix_mapping').innerText = `Button ${index} / -`;
				}
				if (ctx.gamepad.mix_btn_inc && index != ctx.gamepad.mix_btn_inc) {
					ctx.gamepad.mix_btn_dec = index;
					document.getElementById('mix_mapping').innerText =
						`Button ${ctx.gamepad.mix_btn_inc} / ${index}`;
					endMappingMode();
				}
			}
			break;

		default:
			break;
	}

	console.log(`Mapped ${ctx.gamepad.currentMappingFunction} to ${type} ${index}`);
}

const endMappingMode = () => {
	ctx.gamepad.mapping = false;
	ctx.gamepad.currentMappingFunction = null;
}


export function controller_input(time) {
	const gamepads = navigator.getGamepads();
	if (gamepads[ctx.gui.gamepad]) {
		const gp = gamepads[ctx.gui.gamepad];

		if (ctx.gamepad.mapping) {
			/* Button mapping */
			for (let i = 0; i < gp.buttons.length; i++) {
				if (gp.buttons[i].pressed) {
					mapControlToFunction('button', i);
					return;
				}
			}
			/* Axis mapping */
			for (let i = 0; i < gp.axes.length; i++) {
				if (Math.abs(gp.axes[i]) > 0.75) {
					mapControlToFunction('axis', i);
					return;
				}
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

		let yaw = 0.0;
		if (ctx.gamepad.yaw_axis != null) {
			yaw = gp.axes[ctx.gamepad.yaw_axis];
		} else {
			if (ctx.gamepad.yaw_btn_inc != null && ctx.gamepad.yaw_btn_dec != null) {
				yaw += gp.buttons[ctx.gamepad.yaw_btn_inc].pressed ? 1.0 : 0.0;
				yaw -= gp.buttons[ctx.gamepad.yaw_btn_dec].pressed ? 1.0 : 0.0;
			}
		}
		let pitch = 0.0;
		if (ctx.gamepad.pitch_axis != null) {
			pitch = gp.axes[ctx.gamepad.pitch_axis];
		} else {
			if (ctx.gamepad.pitch_btn_inc != null && ctx.gamepad.pitch_btn_dec != null) {
				pitch += gp.buttons[ctx.gamepad.pitch_btn_inc].pressed ? 1.0 : 0.0;
				pitch -= gp.buttons[ctx.gamepad.pitch_btn_dec].pressed ? 1.0 : 0.0;
			}
		}
		let zoom = 0.0;
		if (ctx.gamepad.zoom_axis != null) {
			zoom = gp.axes[ctx.gamepad.zoom_axis];
		} else {
			if (ctx.gamepad.zoom_btn_inc != null && ctx.gamepad.zoom_btn_dec != null) {
				zoom += gp.buttons[ctx.gamepad.zoom_btn_inc].pressed ? 1.0 : 0.0;
				zoom -= gp.buttons[ctx.gamepad.zoom_btn_dec].pressed ? 1.0 : 0.0;
			}
		}
		let mix = 0.0;
		if (ctx.gamepad.mix_axis != null) {
			mix = gp.axes[ctx.gamepad.mix_axis];
		} else {
			if (ctx.gamepad.mix_btn_inc != null && ctx.gamepad.mix_btn_dec != null) {
				mix -= gp.buttons[ctx.gamepad.mix_btn_inc].pressed ? 1.0 : 0.0;
				mix += gp.buttons[ctx.gamepad.mix_btn_dec].pressed ? 1.0 : 0.0;
			}
		}
		/* Get exponential scaling gamepad curve via the axes' magnitude, so the
		   pow operator doesn't restrict diagonal movement. */
		const exp_scale =
			Math.pow(
				Math.sqrt(yaw * yaw + pitch * pitch),
				3);

		if (Math.abs(pitch) > ctx.gui.deadzone)
			ctr.cam.rot_deg[0] -=
				pitch * exp_scale * rotationSpeed * mul * deltaTime;

		if (Math.abs(yaw) > ctx.gui.deadzone)
			ctr.cam.rot_deg[1] -=
				yaw * exp_scale * rotationSpeed * mul * deltaTime;

		if (Math.abs(zoom) > ctx.gui.deadzone)
			ctr.cam.fov.cur +=
				zoom * Math.pow(zoom, 4) * zoomSpeed * mul *
				deltaTime;

		if (ctx.multichannel) {
			if (Math.abs(mix) > ctx.gui.deadzone) {
				ctr.ch2.alpha += mix * 0.05;
				if (ctr.ch2.alpha < 0)
					ctr.ch2.alpha = 0;
				if (ctr.ch2.alpha > 1)
					ctr.ch2.alpha = 1;
				ctx.gui.controller.alpha.updateDisplay();
			}
		}

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
		const gamepadList = document.getElementById('gamepadlist');
		gamepadList.innerHTML = '';
		const gamepads = navigator.getGamepads();
		let defaultAssigned = false;

		for (let i = 0; i < gamepads.length; i++) {
			const gamepad = gamepads[i];

			if (gamepad) {
				const option = document.createElement('option');
				option.value = gamepad.index;
				option.textContent = gamepad.id;
				gamepadList.appendChild(option);
				ctx.gui.controller.gamepad.enable();

				if (!defaultAssigned) {
					ctx.gui.gamepad = gamepad.index;
					defaultAssigned = true;
				}
			}
		}

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
			ctx.gamepad.mapping = true;
			ctx.gamepad.currentMappingFunction = 'yaw';
			ctx.gamepad.yaw_axis = null;
			ctx.gamepad.yaw_btn_inc = null;
			ctx.gamepad.yaw_btn_dec = null;
			document.getElementById('camX_mapping').innerText = 'Waiting for input';
		}
	);

	document.getElementById('camY').addEventListener('click',
		function (event) {
			ctx.gamepad.mapping = true;
			ctx.gamepad.currentMappingFunction = 'pitch';
			ctx.gamepad.pitch_axis = null;
			ctx.gamepad.pitch_btn_inc = null;
			ctx.gamepad.pitch_btn_dec = null;
			document.getElementById('camY_mapping').innerText = 'Waiting for input';
		}
	);

	document.getElementById('zoom').addEventListener('click',
		function (event) {
			ctx.gamepad.mapping = true;
			ctx.gamepad.currentMappingFunction = 'zoom';
			ctx.gamepad.Zoom_axis = null;
			ctx.gamepad.Zoom_btn_inc = null;
			ctx.gamepad.Zoom_btn_dec = null;
			document.getElementById('zoom_mapping').innerText = ' Waiting for input';
		}
	);

	document.getElementById('mix').addEventListener('click',
		function (event) {
			ctx.gamepad.mapping = true;
			ctx.gamepad.currentMappingFunction = 'mix';
			ctx.gamepad.mix_axis = null;
			ctx.gamepad.mix_btn_inc = null;
			ctx.gamepad.mix_btn_dec = null;
			document.getElementById('mix_mapping').innerText = 'Waiting for input';
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
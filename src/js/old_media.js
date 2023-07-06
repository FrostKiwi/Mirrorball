/* Old WASM Media Handler. To be removed after completing the port */

function webcams_get() {
	navigator.mediaDevices.enumerateDevices().then(devices => {
		devices.forEach(device => {
			if (device.kind === 'videoinput') {
				Module.ccall(
					'webcam_add',
					null,
					['string', 'string'],
					[device.deviceId, device.label]
				);
			}
		})
		Module.ccall('format_label_list', null, null, null);
	}
	);
}


function media_setup_js(source) {
	// Create offscreen canvas
	const canvas = new OffscreenCanvas(
		source.videoWidth || source.width, source.videoHeight || source.height);
	const ctx = canvas.getContext('2d', { willReadFrequently: true });

	ctx.drawImage(source, 0, 0);

	const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
	const dataPtr = Module._malloc(imageData.data.length);

	Module.HEAPU8.set(imageData.data, dataPtr);
	Module.ccall(
		'media_setup',
		null,
		['number', 'number', 'number'],
		[dataPtr, canvas.width, canvas.height]
	);

	return [ctx, dataPtr];
}

function media_update_js(source, ctx, dataPtr) {
	ctx.drawImage(source, 0, 0);
	const imageData =
		ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height);
	Module.HEAPU8.set(imageData.data, dataPtr);
	Module.ccall('media_update', null, null, null);
}


const load_from_webcam = async (deviceId) => {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: {
				deviceId: { exact: deviceId },
				width: { ideal: 8192 },
				height: { ideal: 8192 }
			}
		});
		const video = document.createElement('video');

		video.srcObject = stream;
		await new Promise(resolve => {
			video.onloadedmetadata = () => {
				video.play();
				resolve();
			};
		});

		/* Wait for first frame */
		await new Promise(resolve => {
			video.onplaying = resolve;
		});

		const [ctx, dataPtr] = media_setup_js(video);

		const animate = () => {
			media_update_js(video, ctx, dataPtr);
			requestAnimationFrame(animate);
		};

		animate();
	} catch (err) {
		console.error(err);
	}
};

function load_user_photo() {
	const file_selector = document.createElement('input');
	file_selector.type = 'file';
	file_selector.accept = 'image/*';
	file_selector.onchange = event => load_from_url(
		URL.createObjectURL(event.target.files[0])
	);
	file_selector.click();
}

const load_from_url = async (url) => {
	try {
		const response = await fetch(url);
		const blob = await response.blob();
		const bitmap = await createImageBitmap(blob);

		const [ctx, dataPtr] = media_setup_js(bitmap);
		Module._free(dataPtr);
	} catch (err) {
		console.error(err);
	}
};
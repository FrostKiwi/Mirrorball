const webcams_get = () =>
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

const load_from_webcam = async (deviceId) => {
	try {
		const stream = await navigator.mediaDevices.getUserMedia({
			video: {
				deviceId: { exact: deviceId },
				width: { ideal: 8192 },
				height: { ideal: 8192 },
				muted: true,
				loop: true,
				autoplay: true
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

		// Wait for first frame
		await new Promise(resolve => {
			video.onplaying = resolve;
		});

		// Create offscreen canvas
		const canvas = new OffscreenCanvas(video.videoWidth, video.videoHeight);
		const ctx = canvas.getContext('2d', { willReadFrequently: true });
		let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const dataPtr = Module._malloc(imageData.data.length);

		let isFirstFrame = true;
		const animate = () => {
			ctx.drawImage(video, 0, 0);
			imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

			Module.HEAPU8.set(imageData.data, dataPtr);

			if (isFirstFrame) {
				Module.ccall(
					'media_setup',
					null,
					['number', 'number', 'number'],
					[dataPtr, canvas.width, canvas.height]
				);
				isFirstFrame = false;
			} else {
				Module.ccall('media_update', null, null, null);
			}
			requestAnimationFrame(animate); // schedule the next frame
		};

		// Start the animation loop
		animate();
	} catch (err) {
		console.error(err);
	}
};

const load_user_photo = () => {
	let file_selector = document.createElement('input');
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

		const canvas = new OffscreenCanvas(bitmap.width, bitmap.height);
		const ctx = canvas.getContext('2d', { willReadFrequently: true });

		ctx.drawImage(bitmap, 0, 0);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const dataPtr = Module._malloc(imageData.data.length);

		Module.HEAPU8.set(imageData.data, dataPtr);
		Module.ccall(
			'media_setup',
			null,
			['number', 'number', 'number'],
			[dataPtr, canvas.width, canvas.height]
		);
		Module._free(dataPtr);
	} catch (err) {
		console.error(err);
	}
};
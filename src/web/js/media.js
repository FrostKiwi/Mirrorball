const webcamSettings = {
	/* Set requested webcam settings to insane heights, to ensure even highend
	   capture cards are selected with their highest resolution */
	video: {
		width: { ideal: 8192 },
		height: { ideal: 8192 }
	}
};

const webcams_get = () =>
	navigator.mediaDevices.enumerateDevices().then(devices =>
		devices.forEach(device => {
			if (device.kind === 'videoinput') {
				Module.ccall(
					'webcam_add',
					'number',
					['string', 'string'],
					[device.deviceId, device.label]
				);
			}
		})
	);

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
		const ctx = canvas.getContext('2d');

		ctx.drawImage(bitmap, 0, 0);
		const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
		const dataPtr = Module._malloc(imageData.data.length);

		Module.HEAPU8.set(imageData.data, dataPtr);
		Module.ccall(
			'media_setup',
			'number',
			['number', 'number', 'number'],
			[dataPtr, canvas.width, canvas.height]
		);
		Module._free(dataPtr);
	} catch (err) {
		console.error(err);
	}
};
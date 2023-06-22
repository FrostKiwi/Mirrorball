load_from_url = function (url) {
	const img = new Image();
	img.src = url;

	img.onload = function () {
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const context = canvas.getContext('2d', { willReadFrequently: true });

		context.drawImage(img, 0, 0, canvas.width, canvas.height);
		let imageData =
			context.getImageData(0, 0, canvas.width, canvas.height);
		const dataPtr = Module._malloc(imageData.data.length);
		const dataOnHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, imageData.data.length);

		// Call the setup_webcam function with the initial frame
		function setupImage() {
			context.drawImage(img, 0, 0, canvas.width, canvas.height);
			imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			dataOnHeap.set(imageData.data);
			Module.ccall(
				'media_setup',
				'number',
				['number', 'number', 'number', 'number'],
				[dataPtr, imageData.data.length, canvas.width, canvas.height]
			);
		}

		setupImage();
	};

	document.body.appendChild(img);
};
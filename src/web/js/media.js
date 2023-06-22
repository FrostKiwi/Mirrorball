load_from_url = function (url) {
	const img = new Image();
	img.src = url;

	img.onload = function () {
		const canvas = document.createElement('canvas');
		canvas.width = img.width;
		canvas.height = img.height;
		const context = canvas.getContext('2d');

		context.drawImage(img, 0, 0, canvas.width, canvas.height);
		let imageData =
			context.getImageData(0, 0, canvas.width, canvas.height);
		const dataPtr = Module._malloc(imageData.data.length);

		Module.HEAPU8.set(imageData.data, dataPtr);
		Module.ccall(
			'media_setup',
			'number',
			['number', 'number', 'number'],
			[dataPtr, canvas.width, canvas.height]
		);
		Module._free(dataPtr);
	};
};
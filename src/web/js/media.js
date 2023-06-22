load_user_photo = function () {
	let file_selector = document.createElement('input');
	file_selector.type = 'file';
	file_selector.accept = 'image/*';
	file_selector.onchange = event => load_from_url(
		URL.createObjectURL(event.target.files[0])
	);
	file_selector.click();
}

load_from_url = function (url) {
	const img = new Image();
	img.src = url;

	img.decode().then(() => {
		const canvas = document.createElement('canvas');
		[canvas.width, canvas.height] = [img.width, img.height];
		const ctx = canvas.getContext('2d');

		ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
		let imageData =
			ctx.getImageData(0, 0, canvas.width, canvas.height);
		const dataPtr = Module._malloc(imageData.data.length);

		Module.HEAPU8.set(imageData.data, dataPtr);
		Module.ccall(
			'media_setup',
			'number',
			['number', 'number', 'number'],
			[dataPtr, canvas.width, canvas.height]
		);
		Module._free(dataPtr);
	}).catch(
		err => console.log('Image loading failed!', err)
	);
};
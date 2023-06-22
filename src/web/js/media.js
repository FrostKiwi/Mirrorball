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
	fetch(url).then(response => response.blob()).then(blob => {
		createImageBitmap(blob).then(imgBitmap => {
			const offscreen = new OffscreenCanvas(imgBitmap.width, imgBitmap.height);
			const ctx = offscreen.getContext('2d');
			console.log(imgBitmap);

			ctx.drawImage(imgBitmap, 0, 0, offscreen.width, offscreen.height);
			let imageData = ctx.getImageData(0, 0, offscreen.width, offscreen.height);
			const dataPtr = Module._malloc(imageData.data.length);

			Module.HEAPU8.set(imageData.data, dataPtr);
			Module.ccall(
				'media_setup',
				'number',
				['number', 'number', 'number'],
				[dataPtr, offscreen.width, offscreen.height]
			);
			Module._free(dataPtr);
		}).catch(
			err => console.log('ImageBitmap creation failed!', err)
		);
	}).catch(
		err => console.log('Image loading failed!', err)
	);
};

var open_video = function (videoUrl) {
	const video = document.createElement('video');
	video.src = videoUrl;
	video.autoplay = true;
	video.crossOrigin = "anonymous";

	video.onloadedmetadata = function () {
		const canvas = document.createElement('canvas');
		canvas.width = video.videoWidth;
		canvas.height = video.videoHeight;
		const context = canvas.getContext('2d', { willReadFrequently: true });

		let imageData;
		const dataPtr = Module._malloc(canvas.width * canvas.height * 4); // Allocate memory for RGBA image data

		// Call the setup_webcam function with the initial frame
		function setupVideo() {
			context.drawImage(video, 0, 0, canvas.width, canvas.height);
			imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			const dataOnHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, imageData.data.length);
			dataOnHeap.set(imageData.data);
			Module.ccall(
				'setup_webcam',
				'number',
				['number', 'number', 'number', 'number'],
				[dataPtr, imageData.data.length, canvas.width, canvas.height]
			);

			requestAnimationFrame(processFrame);
		}

		// Call the process_webcam function for each frame
		function processFrame() {
			context.drawImage(video, 0, 0, canvas.width, canvas.height);
			imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			const dataOnHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, imageData.data.length);
			dataOnHeap.set(imageData.data);
			Module.ccall('process_webcam');

			requestAnimationFrame(processFrame);
		}

		setupVideo();
	};

	document.body.appendChild(video);
};
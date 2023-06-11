var webcamSettings = {
	video: {
		width: {
			ideal: 8192
		},
		height: {
			ideal: 8192
		}
	}
};

var open_webcam = function () {
	if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
		navigator.mediaDevices.getUserMedia(webcamSettings)
			.then(function (stream) {
				const video = document.createElement('video');
				video.srcObject = stream;
				video.autoplay = true;
				video.onloadedmetadata = function () {
					const canvas = document.createElement('canvas');
					canvas.width = video.videoWidth;
					canvas.height = video.videoHeight;
					const context = canvas.getContext('2d');

					/* TODO: DONT MALLOC EVERY FRAME ! */
					function processFrame() {
						context.drawImage(video, 0, 0, canvas.width, canvas.height);
						const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
						const dataPtr = Module._malloc(imageData.data.length);
						const dataOnHeap = new Uint8Array(Module.HEAPU8.buffer, dataPtr, imageData.data.length);
						dataOnHeap.set(imageData.data);
						Module.ccall(
							'process_webcam',
							'number',
							['number', 'number', 'number'],
							[dataOnHeap.byteOffset, canvas.width, canvas.height]
						);
						Module._free(dataPtr);

						requestAnimationFrame(processFrame);
					}

					processFrame();
				};
				document.body.appendChild(video);
			})
			.catch(function (error) {
				console.error('Error accessing webcam:', error);
			});
	} else {
		console.error('WebRTC getUserMedia API not supported.');
	}
};
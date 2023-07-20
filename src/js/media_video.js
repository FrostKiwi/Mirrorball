import { ctx } from './state.js';
import { user_media, media_setup } from './media.js';

export function list_devices() {
	/* If the selector already exists, return from function */
	if (ctx.loading || document.getElementById('webcam-selector')) return;
	ctx.loading = true;
	document.getElementById('spinner').style.display = 'block';
	document.getElementById('statusMSG').innerText = "Requesting full list of all video devices";

	navigator.mediaDevices.getUserMedia({ video: true })
		.then(stream => {
			/* Make sure to stop the stream */
			stream.getTracks().forEach(track => track.stop());

			/* Enumerate devices after permissions granted */
			navigator.mediaDevices.enumerateDevices()
				.then(devices => {
					getDeviceList(devices)
				})
				.catch(err => {
					document.getElementById('spinner').style.display = 'none';
					console.error('An error occurred: ' + err);
				});
		})
		.catch(err => {
			document.getElementById('spinner').style.display = 'none';
			console.error('User denied permissions,', err);
		});
}

function getDeviceList(devices) {
	let videoDevices = devices.filter(device => device.kind === 'videoinput');
	let selector = document.getElementById('webcams');

	videoDevices.forEach((device, index) => {
		let option = document.createElement('option');
		option.value = device.deviceId;
		/* fallback to Camera n if label is not available */
		option.text = device.label || `Camera ${index + 1}`;
		selector.appendChild(option);
	});

	let startButton = document.getElementById('start');
	startButton.addEventListener('click', () => launch_stream(selector.value));

	let hideElements = document.querySelectorAll('#hide_on_device');
	hideElements.forEach(element => {
		element.style.display = 'none';
	});
	let showElements = document.querySelectorAll('#show_on_device');
	showElements.forEach(element => {
		element.style.display = 'block';
	});
	document.getElementById('webcams').style.display = 'block';
	document.getElementById('start').style.display = 'block';

	document.getElementById('spinner').style.display = 'none';
	ctx.loading = false;
}

export function disable_video() {
	if (ctx.video) {
		ctx.playing = false;
		ctx.continous = false;

		if (ctx.video.srcObject) {
			const tracks = ctx.video.srcObject.getTracks();
			tracks.forEach(track => track.stop());
			ctx.video.srcObject = null;
		}
		ctx.video.remove();
		ctx.video = null;
	}
}

function launch_stream(deviceId) {
	disable_video();

	ctx.loading = true;
	/* Start spinner, hide menus */
	document.getElementById('spinner').style.display = 'block';
	document.getElementById('statusMSG').innerText = "Starting device stream";

	let constraints = {
		video: {
			deviceId: { exact: deviceId },
			width: { ideal: 8192 },
			height: { ideal: 8192 }
		}
	};

	ctx.video = document.createElement('video');

	navigator.mediaDevices.getUserMedia(constraints)
		.then(stream => {
			ctx.video.srcObject = stream;
			ctx.video.onloadedmetadata = function (e) {
				ctx.video.play();
				createImageBitmap(ctx.video).then(bitmap => {
					media_setup(bitmap, user_media);
					ctx.playing = true;
					if (!ctx.continous) {
						ctx.continous = true;
						requestAnimationFrame(ctx.animate_cont);
					}
				});
			};
		})
		.catch(err => console.error('An error occurred: ' + err));
}

export function upload_video() {
	if (ctx.loading) return;
	const file_selector = document.createElement('input');
	file_selector.type = 'file';
	file_selector.accept = 'video/*';
	file_selector.onchange = function (event) {
		user_media.path = URL.createObjectURL(event.target.files[0]);
		user_media.type = "video";
	}
	file_selector.click();
};
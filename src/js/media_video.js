import { ctx} from './state.js';
import { user_media } from './media.js';

export function list_devices() {
	// If the selector already exists, return from function
	if (ctx.loading || document.getElementById('webcam-selector')) return;
	ctx.loading = true;
	// start spinner and hide menus
	document.getElementById('spinner').style.display = 'block';
	document.getElementById('statusMSG').innerText = "Requesting full list of all video devices";

	navigator.mediaDevices.getUserMedia({ video: true })
		.then(stream => {
			// Make sure to stop the stream
			stream.getTracks().forEach(track => track.stop());

			// Enumerate devices after permissions granted
			navigator.mediaDevices.enumerateDevices()
				.then(devices => {
					let videoDevices = devices.filter(device => device.kind === 'videoinput');
					let selector = document.createElement('select');
					selector.id = 'webcam-selector';
					selector.classList.add('list');

					videoDevices.forEach((device, index) => {
						let option = document.createElement('option');
						option.value = device.deviceId;
						option.text = device.label || `Camera ${index + 1}`; // fallback to Camera n if label is not available
						selector.appendChild(option);
					});

					let selectContainer = document.createElement('div');
					let label = document.createElement('p');
					label.textContent = "Select device";
					selectContainer.appendChild(label);
					selectContainer.appendChild(selector);

					// Create start stream button
					let startButton = document.createElement('button');
					startButton.textContent = "Start Stream";
					startButton.id = 'start-stream-button';
					selectContainer.appendChild(startButton);
					startButton.addEventListener('click', () => launch_stream(selector.value));

					// Add the select box and button to the card-description
					document.querySelector('#webcam .card-description').appendChild(selectContainer);

					// Hide elements with id "hide_on_device"
					let hideElements = document.querySelectorAll('#hide_on_device');
					hideElements.forEach(element => {
						element.style.display = 'none';
					});

					// stop spinner and show menus
					document.getElementById('spinner').style.display = 'none';
					ctx.loading = false;
				})
				.catch(err => {
					// stop spinner and show error message
					document.getElementById('spinner').style.display = 'none';
					console.error('An error occurred: ' + err);
				});
		})
		.catch(err => {
			// stop spinner and show error message
			document.getElementById('spinner').style.display = 'none';
			console.error('User denied permissions,', err);
		});
}

function launch_stream(deviceId) {
	let constraints = {
		video: {
			deviceId: { exact: deviceId },
			width: { ideal: 8192 },
			height: { ideal: 8192 }
		}
	};

	const video = document.createElement('video');

	navigator.mediaDevices.getUserMedia(constraints)
		.then(stream => {
			video.srcObject = stream;
			video.onloadedmetadata = function (e) {
				video.play();
				// You may run createImageBitmap here, when video data is ready
				createImageBitmap(video).then(bitmap => {
					// Here you can work with your image bitmap.
					// Just for example, log bitmap to console
					console.log(bitmap);
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
var open_file = function (e) {
	const file_reader = new FileReader();
	file_reader.onload = (event) => {
		const uint8Arr = new Uint8Array(event.target.result);
		const num_bytes = uint8Arr.length * uint8Arr.BYTES_PER_ELEMENT;
		const data_ptr = Module._malloc(num_bytes);
		const data_on_heap =
			new Uint8Array(Module.HEAPU8.buffer, data_ptr, num_bytes);
		data_on_heap.set(uint8Arr);
		const res =
			Module.ccall(
				'load_photo',
				'number',
				['number', 'number'],
				[data_on_heap.byteOffset, uint8Arr.length]
			);
		Module._free(data_ptr);
	};
	file_reader.readAsArrayBuffer(e.target.files[0]);
};

var statusElement = document.getElementById('status');
var progressElement = document.getElementById('progress');

var Module = {
	preRun: [],
	postRun: [],
	print: (function () {
		var element = document.getElementById('output');
		/* clear browser cache */
		if (element) element.value = '';
		return function (text) {
			if (arguments.length > 1)
				text = Array.prototype.slice.call(arguments).join(' ');
			console.log(text);
			if (element) {
				element.value += text + "\n";
				/* focus on bottom */
				element.scrollTop = element.scrollHeight;
			}
		};
	})(),
	canvas: (function () {
		let viewportmeta = document.querySelector('meta[name="viewport"]');
		if (viewportmeta === null) {
			viewportmeta = document.createElement("meta");
			viewportmeta.setAttribute("name", "viewport");
			document.head.appendChild(viewportmeta);

			viewportmeta = document.querySelector('meta[name="viewport"]');
		}
		/* viewportmeta.setAttribute(
			'content', "initial-scale=1.0, minimum-scale=1.0, maximum-scale=1.0"
		); */

		var canvas = document.getElementById('canvas');

		/* As a default initial behavior, pop up an alert when webgl context is
		   lost. To make your application robust, you may want to override this
		   behavior before shipping!
		   See http://www.khronos.org/registry/webgl/specs/latest/1.0/#5.15.2 */
		canvas.addEventListener(
			"webglcontextlost",
			function (e) {
				alert('WebGL context lost. You will need to reload the page.');
				e.preventDefault();
			},
			false
		);

		return canvas;
	})(),
	setStatus: function (text) {
		if (!Module.setStatus.last) Module.setStatus.last =
			{ time: Date.now(), text: '' };
		if (text === Module.setStatus.last.text) return;
		var m = text.match(/([^(]+)\((\d+(\.\d+)?)\/(\d+)\)/);
		var now = Date.now();
		/* if this is a progress update, skip it if too soon */
		if (m && now - Module.setStatus.last.time < 30) return;
		Module.setStatus.last.time = now;
		Module.setStatus.last.text = text;
		if (m) {
			text = m[1];
			progressElement.value = parseInt(m[2]) * 100;
			progressElement.max = parseInt(m[4]) * 100;
			progressElement.hidden = false;
		} else {
			progressElement.value = null;
			progressElement.max = null;
			progressElement.hidden = true;
		}
		statusElement.innerHTML = text;
	},
	totalDependencies: 0,
	monitorRunDependencies: function (left) {
		this.totalDependencies = Math.max(this.totalDependencies, left);
		Module.setStatus(
			left ?
				'Preparing... (' +
				(this.totalDependencies - left) +
				'/' +
				this.totalDependencies +
				')'
				: 'All downloads complete.');
	}
};

Module.setStatus('Downloading...');

window.onerror = function () {
	Module.setStatus('Exception thrown, see JavaScript console');
	Module.setStatus = function (text) {
		if (text) console.error('[post-exception status] ' + text);
	};
};
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
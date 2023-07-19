/* From: https://webglfundamentals.org/webgl/lessons/webgl-boilerplate.html */

import { ctx } from './state.js';

/**
 * Creates and compiles a shader.
 *
 * @param {!WebGLRenderingContext} gl The WebGL Context.
 * @param {string} shaderSource The GLSL source code for the shader.
 * @param {number} shaderType The type of shader, VERTEX_SHADER or
 *     FRAGMENT_SHADER.
 * @return {!WebGLShader} The shader.
 */
function compileShader(gl, shaderSource, shaderType) {
	// Create the shader object
	var shader = gl.createShader(shaderType);

	// Set the shader source code.
	gl.shaderSource(shader, shaderSource);

	// Compile the shader
	gl.compileShader(shader);

	// Check if it compiled
	var success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if (!success) {
		// Something went wrong during compilation; get the error
		throw "could not compile shader:" + gl.getShaderInfoLog(shader);
	}

	return shader;
}

/**
 * Creates a program from 2 shaders.
 *
 * @param {!WebGLRenderingContext} gl The WebGL context.
 * @param {!WebGLShader} vertexShader A vertex shader.
 * @param {!WebGLShader} fragmentShader A fragment shader.
 * @return {!WebGLProgram} A program.
 */
function createProgram(gl, vertexShader, fragmentShader) {
	// create a program.
	var program = gl.createProgram();

	// attach the shaders.
	gl.attachShader(program, vertexShader);
	gl.attachShader(program, fragmentShader);

	// link the program.
	gl.linkProgram(program);

	// Check if it linked.
	var success = gl.getProgramParameter(program, gl.LINK_STATUS);
	if (!success) {
		// something went wrong with the link
		throw ("program failed to link:" + gl.getProgramInfoLog(program));
	}

	return program;
};

export function compile_and_link(gl, vertex, fragment) {
	const vs = compileShader(gl, vertex, gl.VERTEX_SHADER);
	const fs = compileShader(gl, fragment, gl.FRAGMENT_SHADER);
	return createProgram(gl, vs, fs);
}

export function print_glinfo() {
	console.log(
		"WebGL Version: " + ctx.gl.getParameter(ctx.gl.VERSION) + '\n' +
		"Vendor: " + ctx.gl.getParameter(ctx.gl.VENDOR) + '\n' +
		"Renderer: " + ctx.gl.getParameter(ctx.gl.RENDERER) + '\n' +
		"GLSL Version: " +
		ctx.gl.getParameter(ctx.gl.SHADING_LANGUAGE_VERSION) + '\n' +
		"Max tex-size: " +
		ctx.gl.getParameter(ctx.gl.MAX_TEXTURE_SIZE) + "px²");
}
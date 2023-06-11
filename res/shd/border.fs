#version 100
precision mediump float;
uniform vec3 color;
varying vec2 vtx_fs;


void main()
{
	if (length(vtx_fs) < 1.0)
		gl_FragColor = vec4(color, 1);
	else
		discard;
}
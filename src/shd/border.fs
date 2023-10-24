#version 100
precision mediump float;
uniform vec3 color;
varying vec2 vtx_fs;
uniform float alpha;

void main()
{
	if (length(vtx_fs) < 0.8)
		gl_FragColor = vec4(color, alpha);
	else
		discard;
}
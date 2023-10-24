#version 100
#extension GL_OES_standard_derivatives : enable
precision mediump float;
uniform vec3 color;
varying vec2 vtx_fs;
uniform float alpha;

void main()
{
	float dist = length(vtx_fs) - 0.8;
	float smoothedAlpha = 1.5 * dist / fwidth(dist);
	gl_FragColor = vec4(color, alpha - smoothedAlpha);
}
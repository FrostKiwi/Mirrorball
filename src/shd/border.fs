#version 100
precision mediump float;
uniform vec3 color;
varying vec2 vtx_fs;
uniform float alpha;
uniform float pxsize;
uniform float pxsize_rcp;

void main()
{
	vec3 blackColor = vec3(0.0);

	float dist = length(vtx_fs) - (1.0 - pxsize);

	float smoothedAlpha_black = dist * pxsize_rcp;
	float smoothedAlpha_color = max((dist + 0.2) * pxsize_rcp, 0.0);

	vec3 finalColor = mix(blackColor, color, 1.0 - smoothedAlpha_color);
	gl_FragColor = vec4(finalColor, alpha * (1.0 - smoothedAlpha_black));
}
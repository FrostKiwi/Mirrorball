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

	/* Cricle SDF, minus pixel size */
	float dist = length(vtx_fs) - (1.0 - pxsize);

	/* Using reciprocal to avoid division */
	float smoothedAlpha_black = dist * pxsize_rcp;
	/* Need to clamp, but only one direciton, so using max. Logically it should
	   be min, but the SDF works the other way around. */
	float smoothedAlpha_color = max((dist + pxsize) * pxsize_rcp, 0.0);

	/* Add a slight gradient */
	vec3 gradient = color * ((vtx_fs.y + 1.5) * 0.5);

	vec3 finalColor = mix(blackColor, gradient, 1.0 - smoothedAlpha_color);
	gl_FragColor = vec4(finalColor, alpha * (1.0 - smoothedAlpha_black));
}
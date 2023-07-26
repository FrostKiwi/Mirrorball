#version 100
precision mediump float;
varying vec2 tex;
varying vec2 circle;
uniform sampler2D sample;
uniform bool mask_toggle;
uniform float alpha;

void main()
{
	if (mask_toggle && length(circle) > 1.0)
		gl_FragColor = vec4(0, 0, 0, alpha);
	else
		gl_FragColor = vec4(texture2D(sample, tex).rgb, alpha);
}
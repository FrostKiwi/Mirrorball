#version 100
precision mediump float;
varying vec2 tex;
varying vec2 circle;
uniform sampler2D sample;
uniform float mask_toggle;
void main()
{
    /* Use step instead of length to avoid branching */
	float mask = step(length(circle), 1.0);
	gl_FragColor = mix(texture2D(sample, tex),
					   vec4(0, 0, 0, 1),
					   mask_toggle * (1.0 - mask));
}
#version 100
precision mediump float;
varying vec2 tex;
varying vec2 circle;
uniform sampler2D sample;
void main()
{
	if(length(circle) < 1.0)
		gl_FragColor = texture2D(sample, tex);
	else
		discard;
}
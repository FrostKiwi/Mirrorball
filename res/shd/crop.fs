#version 100
precision mediump float;
varying vec2 tex;
uniform sampler2D sample;
void main()
{
	gl_FragColor = texture2D(sample, tex);
}
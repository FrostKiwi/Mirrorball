#version 100
attribute vec2 pos;
attribute vec3 rayvtx;
varying vec3 Ray;
void main()
{
	Ray = rayvtx;
	gl_Position = vec4(pos, 1.0, 1.0);
}
#version 100

varying vec2 tex;
attribute vec2 vtx;
attribute vec2 coord;

void main()
{
    tex = coord;
	gl_Position = vec4(vtx, 0.0, 1.0);
}
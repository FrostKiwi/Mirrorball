#version 100
attribute vec2 vtx;
varying vec2 vtx_fs;
uniform vec2 scale;
uniform vec2 transform;
uniform vec4 split;

void main()
{
	vtx_fs = vtx;
	vec2 vtx_move = vtx * scale;
	vtx_move = vtx_move + transform;
	vtx_move *= vec2(split.z, split.w);
	vtx_move += vec2(split.x, split.y);
	gl_Position = vec4(vtx_move, 0.0, 1.0);
}
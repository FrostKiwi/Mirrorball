#version 100
attribute vec2 vtx;
varying vec2 vtx_fs;
uniform float aspect_w;
uniform float aspect_h;
uniform float scale;
uniform vec2 transform;

void main()
{
	vtx_fs = vtx;
	vec2 vtx_move = vtx * scale;
	vtx_move = vtx_move + transform;
	gl_Position = vec4(vtx_move.x * aspect_w, vtx_move.y * aspect_h, 0.0, 1.0);
}
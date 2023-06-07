#version 100
attribute vec2 vtx;
varying vec2 vtx_fs;
uniform vec4 crop;
uniform float aspect_w;
uniform float aspect_h;
uniform float scale;
uniform vec2 transform;

void main()
{
	vtx_fs = vtx;
	vec2 vtx_transform = vtx * scale;
	vtx_transform = vtx_transform + transform;
	gl_Position = vec4(vtx_transform.x * aspect_w, vtx_transform.y * aspect_h, 0.0, 1.0);
}
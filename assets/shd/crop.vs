#version 100
varying vec2 tex;
varying vec2 circle;
uniform float aspect_w;
uniform float aspect_h;
uniform vec4 crop;
attribute vec2 vtx;
attribute vec2 coord;

void main()
{
	circle = vtx;
	tex = coord * vec2(crop.z, crop.w) + vec2(crop.x, crop.y);
	gl_Position = vec4(vtx.x * aspect_w, vtx.y * aspect_h, 0.0, 1.0);
}
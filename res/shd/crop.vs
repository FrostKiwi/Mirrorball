#version 100
varying vec2 tex;
uniform float aspect_w;
uniform float aspect_h;
uniform vec4 crop;
attribute vec2 pos;
attribute vec2 coord;

void main()
{
	tex = coord * vec2(crop.z, crop.w) + vec2(crop.x, crop.y);
	gl_Position = vec4(pos.x * aspect_w, pos.y * aspect_h, 0.0, 1.0);
}
#version 100
attribute vec2 vtx;
uniform vec4 crop;
uniform float aspect_w;
uniform float aspect_h;
uniform vec2 transform;

void main()
{
	vec2 vtx_transform = vtx + transform;
    gl_Position = vec4(vtx_transform, 0.0, 1.0);
}
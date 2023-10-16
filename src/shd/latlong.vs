#version 100

varying vec2 tex;
attribute vec2 vtx;
attribute vec2 coord;
uniform vec4 split;

void main()
{
    tex = coord;
	gl_Position = vec4(vtx * vec2(split.z, split.w) + vec2(split.x, split.y),
					   0.0, 1.0);
}
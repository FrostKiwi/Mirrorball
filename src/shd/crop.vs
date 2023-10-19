varying vec2 tex;
varying vec2 circle;
uniform float aspect_w;
uniform float aspect_h;
uniform vec4 crop;
attribute vec2 vtx;
attribute vec2 coord;
uniform vec4 split;

void main()
{
	circle = vtx;
	tex = coord * vec2(crop.z, crop.w) + vec2(crop.x, crop.y);
	gl_Position = vec4(
		vec2(vtx.x * aspect_w * split.z + split.x,
			 vtx.y * aspect_h * split.w + split.y),
		0.0,
		1.0);
}
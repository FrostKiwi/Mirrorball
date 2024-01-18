attribute vec2 pos;
attribute vec3 rayvtx;
attribute vec3 rayvtx_blind;
varying vec3 Ray;
varying vec3 Ray_blind;
uniform vec4 split;

void main()
{
	Ray = rayvtx;
	Ray_blind = rayvtx_blind;
	gl_Position = vec4(pos * vec2(split.z, split.w) + vec2(split.x, split.y),
					   0.0, 1.0);
}
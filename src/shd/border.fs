#version 100
precision mediump float;
uniform vec3 color;
varying vec2 vtx_fs;

void main()
{
	if (length(vtx_fs) < 1.0)
		/* Should use Antialiased drawing via screen space derivatives, which is
		   WebGL 1.0 compatibile. But I didn't implement an extension check yet,
		   so just to be sure let's draw it without anti-aliasing to be sure. */
		gl_FragColor = vec4(color, 1);
	else
		discard;
}
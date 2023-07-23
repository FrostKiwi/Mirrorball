#version 100
#define M_2xSQRT2 2.8284271247461900976033774484194
/* High float precision required, because angle calculation gets quite bad at
   medium */
precision highp float;
varying vec3 Ray;
uniform vec4 crop;
uniform float scalar;
uniform sampler2D sample_projection;

void main()
{
	vec3 R = normalize(Ray);
	/* Scalar precalculated on CPU */
	vec2 uv = scalar * R.xy / (M_2xSQRT2 * sqrt(R.z + 1.0));
	/* Extra scalar branch to prevent artifacts from bad GPU float precision */
	/* Should switch to using multiple shaders instead of branching */
	if (length(uv) >= 0.5 && scalar > 1.0)
		/* Should use Antialiased drawing via screen space derivatives, which is
		   WebGL 1.0 compatibile. But I didn't implement an extension check yet,
		   so just to be sure let's draw it without anti-aliasing to be sure. */
		gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
	else
	{
		/* Scale from NDC to UV space */
		uv *= vec2(crop.z, crop.w);
		uv.x = crop.x + uv.x;
		uv.y = crop.y - uv.y;
		gl_FragColor = texture2D(sample_projection, uv);
	}
}
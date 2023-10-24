#version 100

/* High float precision required, because angle calculation gets quite bad at
   medium */
precision highp float;

#define M_2SQRT2 2.8284271247461900976033774484194
uniform vec4 crop;
uniform float scalar;
uniform sampler2D sample_projection;
varying vec2 tex;
uniform mat3 rotMat;
uniform float alpha;

void main()
{
	vec3 r = rotMat * vec3(sin(tex.x) * sin(tex.y),
						   cos(tex.x),
						   sin(tex.x) * cos(tex.y) * -1.0);

	vec2 uv = vec2(-r.x, r.y) * scalar / (M_2SQRT2 * sqrt(r.z + 1.0));

	if (length(uv) >= 0.5 && scalar > 1.0)
		gl_FragColor = vec4(0.0, 0.0, 0.0, alpha);
	else
	{
		uv *= vec2(crop.z, crop.w);
		uv.x = crop.x + uv.x;
		uv.y = crop.y - uv.y;
		gl_FragColor = vec4(texture2D(sample_projection, uv).rgb, alpha);
	}
}
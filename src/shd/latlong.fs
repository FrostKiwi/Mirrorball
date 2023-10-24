#ifdef USE_DERIVATIVES
#extension GL_OES_standard_derivatives : enable
#endif

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

	float blind_spot = length(uv) - 0.5;
	/* Extra scalar branch to prevent artifacts from bad GPU float precision at
	   sphere's FOV = 360° */
	float smoothedAlpha;
	if (scalar == 1.0)
		smoothedAlpha = 1.0;
	else
		smoothedAlpha = clamp(0.5 - blind_spot / (fwidth(blind_spot)), 0.0, 1.0);
		
	float factorBlack = alpha - smoothedAlpha;

	uv *= vec2(crop.z, crop.w);
	uv.x = crop.x + uv.x;
	uv.y = crop.y - uv.y;
	gl_FragColor = vec4(texture2D(sample_projection, uv).rgb, 1.0 - factorBlack);
}

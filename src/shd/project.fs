#ifdef USE_DERIVATIVES
#extension GL_OES_standard_derivatives : enable
#endif

#define M_2xSQRT2 2.8284271247461900976033774484194
/* High float precision required, because angle calculation gets quite bad at
   medium */
precision highp float;
varying vec3 Ray;
uniform vec4 crop;
uniform float scalar;
uniform float scalar_rcp;
uniform sampler2D sample_projection;
uniform bool area_toggle;
uniform float area_f;
uniform float area_b;
uniform float alpha;

void main()
{
	vec3 R = normalize(Ray);
	vec2 dist = scalar * R.xy / (M_2xSQRT2 * sqrt(R.z + 1.0));

	float blind_spot = length(dist) - 0.5;
	float smoothedAlpha = clamp(0.5 - blind_spot / (fwidth(blind_spot)), 0.0, 1.0);

	vec2 uv = dist * vec2(crop.z, crop.w);
	uv.x = crop.x + uv.x;
	uv.y = crop.y - uv.y;

	vec4 baseColor = vec4(texture2D(sample_projection, uv).rgb, alpha);
	vec4 greenColor = baseColor * vec4(0.5, 1, 0.5, alpha);
	vec4 redColor = baseColor * vec4(1, 0.5, 0.5, alpha);
	vec4 blackColor = vec4(0.0, 0.0, 0.0, alpha);

	// Using division-based method for antialiasing
	float lenDist = length(dist * scalar_rcp);

	float factorGreen = clamp((area_f - lenDist) / fwidth(lenDist), 0.0, 1.0);
	float factorRed = clamp((lenDist - area_b) / fwidth(lenDist), 0.0, 1.0);
	float factorBlack = 1.0 - smoothedAlpha;

	gl_FragColor = baseColor * (1.0 - factorGreen - factorRed - factorBlack) +
				   greenColor * factorGreen +
				   redColor * factorRed +
				   blackColor * factorBlack;
}

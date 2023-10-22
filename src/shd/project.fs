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
	if (area_toggle && length(dist * scalar_rcp) < area_f)
		gl_FragColor = mix(vec4(0.0, 0.0, 0.0, alpha), vec4(texture2D(sample_projection, uv).rgb, alpha) * vec4(0.5, 1, 0.5, alpha), smoothedAlpha);
	else if (area_toggle && length(dist * scalar_rcp) > area_b)
		gl_FragColor = mix(vec4(0.0, 0.0, 0.0, alpha), vec4(texture2D(sample_projection, uv).rgb, alpha) * vec4(1, 0.5, 0.5, alpha), smoothedAlpha);
	else
		gl_FragColor = mix(vec4(0.0, 0.0, 0.0, alpha), vec4(texture2D(sample_projection, uv).rgb, alpha), smoothedAlpha);
}
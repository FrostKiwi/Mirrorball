#version 100
#extension GL_OES_standard_derivatives : enable
#define M_2xSQRT2 2.8284271247461900976033774484194
/* High float precision required, because angle calculation gets quite bad at
   medium */
precision highp float;
varying vec3 Ray;
varying vec3 Ray_blind;
uniform vec4 crop;
uniform float scalar;
uniform float scalar_blind;
uniform sampler2D sample_projection;
uniform float area_toggle;
uniform bool mask_toggle;
uniform float area_f;
uniform float area_b;
uniform float alpha;

void main()
{
	vec3 R = normalize(Ray);
	/* Incident Ray calculation, unscaled */
	vec2 iRay = R.xy / (M_2xSQRT2 * sqrt(R.z + 1.0));
	vec2 iRay_scaled = scalar * iRay;

	float blind_spot = length(iRay_scaled) - 0.5;
	float smoothedAlpha;
	if (scalar == 1.0)
		smoothedAlpha = 1.0;
	else
		smoothedAlpha = clamp(0.5 - blind_spot / (fwidth(blind_spot)), 0.0, 1.0);

	vec2 uv = iRay_scaled * vec2(crop.z, crop.w);
	uv.x = crop.x + uv.x;
	uv.y = crop.y - uv.y;

	vec4 baseColor = vec4(texture2D(sample_projection, uv).rgb, alpha);
	vec4 greenColor = baseColor * vec4(0.5, 1, 0.5, alpha);
	vec4 redColor = baseColor * vec4(1, 0.5, 0.5, alpha);
	vec4 blackColor = vec4(0.0, 0.0, 0.0, alpha);
	
	float lenDist = length(iRay);
	
	if (!mask_toggle)
	{
		/* Recalc Blindspot fill with flipped Yaw */
		R = normalize(Ray_blind);
		/* Scalar precalculated on CPU */
		iRay = R.xy / (M_2xSQRT2 * sqrt(R.z + 1.0));
		iRay_scaled = scalar_blind * iRay;

		/* Scale from NDC to UV space */
		vec2 uv = iRay_scaled * vec2(crop.z, crop.w);
		uv.x = crop.x + uv.x;
		uv.y = crop.y - uv.y;
		
		blackColor = vec4(texture2D(sample_projection, uv).rgb, alpha);
	}

	float factorGreen = area_toggle * clamp((area_f - lenDist) / fwidth(lenDist), 0.0, 1.0);
	float factorRed = area_toggle * clamp((lenDist - area_b) / fwidth(lenDist), 0.0, 1.0);
	float factorBlack = 1.0 - smoothedAlpha;

	gl_FragColor = baseColor * (1.0 - factorGreen - factorRed - factorBlack) +
				   greenColor * factorGreen +
				   redColor * factorRed +
				   blackColor * factorBlack;
}

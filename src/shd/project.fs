#version 100
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
uniform bool mask_toggle;
uniform bool area_toggle;
uniform float area_f;
uniform float area_b;
uniform float alpha;

void main()
{
	vec3 R = normalize(Ray);
	/* Scalar precalculated on CPU */
	vec2 iRay = R.xy / (M_2xSQRT2 * sqrt(R.z + 1.0));
	vec2 iRay_scaled = scalar * iRay;

	/* Extra scalar branch to prevent artifacts from bad GPU float precision */
	if (length(iRay_scaled) >= 0.5 && scalar > 1.0)
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

		/* Toggle to black when in mask mode */
		if (mask_toggle)
			gl_FragColor = vec4(vec3(0.0), alpha);
		else
			gl_FragColor = vec4(texture2D(sample_projection, uv).rgb, alpha);
	}
	else
	{
		/* Scale from NDC to UV space */
		vec2 uv = iRay_scaled * vec2(crop.z, crop.w);
		uv.x = crop.x + uv.x;
		uv.y = crop.y - uv.y;

		/* Handle Area Viz drawing */
		if (area_toggle && length(iRay) < area_f)
			gl_FragColor = vec4(texture2D(sample_projection, uv).rgb, alpha) * vec4(0.5, 1, 0.5, alpha);
		else if (area_toggle && length(iRay) > area_b)
			gl_FragColor = vec4(texture2D(sample_projection, uv).rgb, alpha) * vec4(1, 0.5, 0.5, alpha);
		else
			gl_FragColor = vec4(texture2D(sample_projection, uv).rgb, alpha);
	}
}
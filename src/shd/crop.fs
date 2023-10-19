precision mediump float;
varying vec2 tex;
varying vec2 circle;
uniform sampler2D sample;
uniform bool mask_toggle;
uniform bool area_toggle;
uniform float area_f;
uniform float area_b;
uniform float alpha;
uniform float scalar;
uniform float scalar_rcp;

void main()
{
	if (mask_toggle && length(circle) > 1.0)
		gl_FragColor = vec4(0, 0, 0, alpha);
	else
	{
		if (area_toggle && length(circle * scalar_rcp) < area_f)
			gl_FragColor = vec4(texture2D(sample, tex).rgb, alpha) * vec4(0.5, 1, 0.5, alpha);
		else if (area_toggle && length(circle * scalar_rcp) > area_b && length(circle) < 1.0)
			gl_FragColor = vec4(texture2D(sample, tex).rgb, alpha) * vec4(1, 0.5, 0.5, alpha);
		else
			gl_FragColor = vec4(texture2D(sample, tex).rgb, alpha);
	}
}
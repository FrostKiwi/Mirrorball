#version 100
precision mediump float;
varying vec2 tex;
varying vec2 circle;
uniform sampler2D sample;
uniform bool mask_toggle;
uniform float alpha;

void main()
{
	if (mask_toggle && length(circle) > 1.0)
		gl_FragColor = vec4(0, 0, 0, alpha);
	else
	{
		if (length(circle) < 0.3826)
			gl_FragColor = vec4(texture2D(sample, tex).rgb, alpha) * vec4(0.5, 1, 0.5, alpha);
		else if (length(circle) > 0.707 && length(circle) < 1.0)
			gl_FragColor = vec4(texture2D(sample, tex).rgb, alpha) * vec4(1, 0.5, 0.5, alpha);
		else
			gl_FragColor = vec4(texture2D(sample, tex).rgb, alpha);
	}
}
#version 100
precision mediump float;
varying vec2 tex;
varying vec2 circle;
uniform sampler2D sample;
uniform float mask_toggle;
uniform float area_toggle;
uniform float area_f;
uniform float area_b;
uniform float alpha;
uniform float scalar_rcp;
uniform float pxsize;
uniform float pxsize_rcp;

void main()
{
	/* Screen Space derivative free AA. Technically it ignores the crop's aspect
	   ratio, but its such an edge case (heh) */
    float circleLength = length(circle);
    float blind_spot = circleLength - (1.0 - (pxsize * 0.5));
    
    float smoothedAlpha = clamp(0.5 - blind_spot * pxsize_rcp, 0.0, 1.0);

    vec3 baseColor = texture2D(sample, tex).rgb;
    vec3 greenColor = baseColor * vec3(0.5, 1, 0.5);
    vec3 redColor = baseColor * vec3(1, 0.5, 0.5);
    vec3 blackColor = vec3(0.0);

    float lenCircle = length(circle * scalar_rcp);
    
    float factorGreen = area_toggle * clamp((area_f - lenCircle) * pxsize_rcp, 0.0, 1.0);
    float factorRed = area_toggle * clamp((lenCircle - area_b) * pxsize_rcp, 0.0, 1.0) * smoothedAlpha;
    float factorBlack = mask_toggle * (1.0 - smoothedAlpha);

    vec3 finalColor = baseColor * (1.0 - factorGreen - factorRed - factorBlack) +
                      greenColor * factorGreen +
                      redColor * factorRed +
                      blackColor * factorBlack;

    gl_FragColor = vec4(finalColor, alpha);
}
#ifdef USE_DERIVATIVES
#extension GL_OES_standard_derivatives : enable
#endif

precision mediump float;
varying vec2 tex;
varying vec2 circle;
uniform sampler2D sample;
uniform float mask_toggle;
uniform float area_toggle;
uniform float area_f;
uniform float area_b;
uniform float alpha;
uniform float scalar;
uniform float scalar_rcp;

void main()
{
    float circleLength = length(circle);

    float blind_spot = circleLength - 1.0;
    float smoothedAlpha = clamp(0.5 - blind_spot / (fwidth(blind_spot)), 0.0, 1.0);

    vec4 baseColor = vec4(texture2D(sample, tex).rgb, alpha);
    vec4 greenColor = baseColor * vec4(0.5, 1, 0.5, alpha);
    vec4 redColor = baseColor * vec4(1, 0.5, 0.5, alpha);
    vec4 blackColor = vec4(0.0, 0.0, 0.0, alpha);

    float lenCircle = length(circle * scalar_rcp);

    float factorGreen = area_toggle * clamp((area_f - lenCircle) / fwidth(lenCircle), 0.0, 1.0);
    float factorRed = area_toggle * clamp((lenCircle - area_b) / fwidth(lenCircle), 0.0, 1.0) * smoothedAlpha;
    float factorBlack = mask_toggle * (1.0 - smoothedAlpha);

    gl_FragColor = baseColor * (1.0 - factorGreen - factorRed - factorBlack) +
                   greenColor * factorGreen +
                   redColor * factorRed +
                   blackColor * factorBlack;
}

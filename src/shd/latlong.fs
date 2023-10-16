#version 330
#define M_2SQRT2 2.8284271247461900976033774484194

uniform vec4 crop;
uniform float scalar;
uniform sampler2D sample_projection;
out vec4 Out_Color;
in vec2 tex;

void main()
{
    vec2 uv;
    /* float rx = sin(tex.x) * cos(tex.y);
    float ry = sin(tex.x) * sin(tex.y);
    float rz = cos(tex.x); */
    float rx = sin(tex.x) * sin(tex.y);
    float ry = cos(tex.x); 
    float rz = sin(tex.x) * cos(tex.y) * -1.0;
    uv.x = rx * scalar / (M_2SQRT2 * sqrt(rz + 1.0));
    uv.x = uv.x * - 1.0;
    uv.y = ry * scalar / (M_2SQRT2 * sqrt(rz + 1.0));
	if(length(uv) >= 0.5) Out_Color = vec4(0.0, 0.0, 0.0, 1.0);
    else{
    uv *= vec2(crop.z, crop.w);
	uv.x = crop.x + uv.x;
	uv.y = crop.y - uv.y;
	Out_Color = texture(sample_projection, uv);
    }
}

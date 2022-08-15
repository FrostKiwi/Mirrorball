#version 330
in vec2 tex;
uniform sampler2D sample_Y;
uniform sampler2D sample_U;
uniform sampler2D sample_V;
out vec4 Out_Color;

const vec3 R_cf = vec3(1.164383,  0.000000,  1.596027);
const vec3 G_cf = vec3(1.164383, -0.391762, -0.812968);
const vec3 B_cf = vec3(1.164383,  2.017232,  0.000000);
const vec3 offset = vec3(-0.0625, -0.5, -0.5);

void main()
{
    float y = texture(sample_Y, tex).r;
    float u = texture(sample_U, tex).r;
    float v = texture(sample_V, tex).r;
    vec3 yuv = vec3(y,u,v);
    yuv += offset;
    Out_Color = vec4(0.0, 0.0, 0.0, 1.0);
    Out_Color.r = dot(yuv, R_cf);
    Out_Color.g = dot(yuv, G_cf);
    Out_Color.b = dot(yuv, B_cf);
}

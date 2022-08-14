#version 330
in vec2 tex;
uniform sampler2D sample;
out vec4 Out_Color;

void main()
{
    Out_Color = texture(sample, tex);
}

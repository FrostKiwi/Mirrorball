#version 330

in vec2 pos;
in vec3 rayvtx;
out vec3 Ray;

void main()
{
    Ray = rayvtx;
    gl_Position = vec4(pos, 1.0, 1.0);
}

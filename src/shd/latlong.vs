#version 330

out vec2 tex;

const vec2 pos[4] = vec2[] (
    vec2(-1.0,  1.0),
    vec2( 1.0,  1.0),
    vec2( 1.0, -1.0),
    vec2(-1.0, -1.0)
);

/* const vec2 coord[4] = vec2[] (
    vec2(0.0, 0.0),
    vec2(6.2831853, 0.0),
    vec2(6.2831853, 3.1415926),
    vec2(0.0, 3.1415926)
); */

const vec2 coord[4] = vec2[] (
    vec2(0.0, 6.2831853),
    vec2(0.0, 0.0),
    vec2(3.1415926, 0.0),
    vec2(3.1415926, 6.2831853)
    
);

void main()
{
    tex = coord[gl_VertexID];
    gl_Position = vec4(pos[gl_VertexID], 0.0, 1.0);
}

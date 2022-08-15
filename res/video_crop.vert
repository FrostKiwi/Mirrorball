#version 330
out vec2 tex;
uniform float aspect_h;
uniform float aspect_w;
uniform vec4 crop;

const vec2 pos[4] = vec2[] (
    vec2(-1.0,  1.0),
    vec2( 1.0,  1.0),
    vec2( 1.0, -1.0),
    vec2(-1.0, -1.0)
);

const vec2 coord[4] = vec2[] (
    vec2(0.0, 0.0),
    vec2(1.0, 0.0),
    vec2(1.0, 1.0),
    vec2(0.0, 1.0)
);

void main()
{
    tex = coord[gl_VertexID] * vec2(crop.z, crop.w) + vec2(crop.x, crop.y);
    gl_Position = vec4(pos[gl_VertexID].x * aspect_w,
		       pos[gl_VertexID].y * aspect_h, 0.0, 1.0);
}

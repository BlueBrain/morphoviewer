#version 300 es

uniform float uniZ;
in vec2 attPoint;
in vec2 attUV;
out vec2 varUV;

void main() {
    varUV = attUV;
    gl_Position = vec4(attPoint.xy, uniZ, 1.0);
}
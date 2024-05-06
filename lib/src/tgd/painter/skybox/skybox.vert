#version 300 es

in vec4 attPoint;

out vec4 varPoint;

void main() {
    varPoint = attPoint;
    gl_Position = vec4(attPoint.xy, 0.99999, 1.0);
}
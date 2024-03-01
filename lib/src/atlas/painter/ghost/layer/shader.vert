#version 300 es

precision mediump float;

in vec2 attPosition;

out vec2 varUV;

void main() {
    float x = attPosition.x;
    float y = attPosition.y;
    varUV = vec2(0.5 * (1.0 + x), 0.5 * (1.0 + y));
    gl_Position = vec4(attPosition, 0.5, 1.0);
}

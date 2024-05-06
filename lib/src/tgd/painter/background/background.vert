#version 300 es

uniform float uniZoom;
uniform vec2 uniScale;
uniform vec2 uniScroll;
uniform float uniZ;
in vec2 attPoint;
in vec2 attUV;
out vec2 varUV;

void main() {
    varUV = (attUV + uniScroll) * uniZoom;
    float x = uniScale.x * attPoint.x;
    float y = uniScale.y * attPoint.y;
    gl_Position = vec4(x, y, uniZ, 1.0);
}
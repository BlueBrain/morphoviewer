#version 300 es

precision mediump float;

uniform vec4 uniColor;
out vec4 FragColor;

const vec3 COLOR = vec3(1.0, 0.667, 0.0);

void main() {
    vec2 v = 2.2 * gl_PointCoord - vec2(1.1);
    float f = 1.0 - dot(v, v);
    if (f < 0.0) discard;

    float a = smoothstep(0.0, 0.2, f);
    FragColor = vec4(uniColor.rgb * f, uniColor.a);
}

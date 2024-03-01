#version 300 es

precision highp float;

in vec3 varNormal;
out vec4 FragColor;

const vec3 SHIFT = vec3(1.0, 1.0, 1.0);

void main() {
    vec3 normal = normalize(varNormal);
    vec3 color = (normal + SHIFT) * 0.5;
    FragColor = vec4(color, 1.0);
}

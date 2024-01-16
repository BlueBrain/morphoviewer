#version 300 es

precision mediump float;

in vec3 varNormal;
out vec4 FragColor;

const vec3 COLOR = vec3(1.0, 1.0, 1.0);

void main() {
    vec3 normal = normalize(varNormal);
    float alpha = (1.0 - abs(normal.z));
    alpha *= alpha;
    FragColor = vec4(COLOR * alpha, 1.0);
}

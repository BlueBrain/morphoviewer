#version 300 es

precision highp float;

uniform samplerCube uniTexture;
uniform mat4 uniMatrix;

in vec4 varPoint;

out vec4 FragColor;

void main() {
    vec4 t = uniMatrix * varPoint;
    FragColor = texture(uniTexture, normalize(t.xyz / t.w));
}
#version 300 es

precision mediump float;

uniform sampler2D uniTexture;
in vec2 varUV;
out vec4 FragColor;

vec4 getColor();

void main() {
    FragColor = getColor();// texture(uniTexture, varUV);
}

vec4 getColor() {

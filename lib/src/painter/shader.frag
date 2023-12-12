#version 300 es

precision mediump float;

uniform sampler2D uniTexture;

in vec3 varColor;
out vec4 FragColor;


void main() {
    FragColor = vec4(varColor, 1.0);
}

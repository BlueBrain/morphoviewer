#version 300 es

precision mediump float;

in vec4 varColor;
out vec4 FragColor;


void main() {
    if (varColor.a < 1.0) discard;
    else FragColor = varColor;
}

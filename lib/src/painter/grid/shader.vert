#version 300 es

precision mediump float;

uniform mat4 uniModelViewMatrix;
uniform mat4 uniProjectionMatrix;
uniform vec3 uniCenter;

in vec3 attPos;
in vec3 attCol;
out vec3 varColor;

const float EPSILON = 0.0;

void main() {
    varColor = attCol;
    // Project in screen space.
    gl_Position = uniProjectionMatrix * uniModelViewMatrix * vec4(attPos + uniCenter, 1.0);
}

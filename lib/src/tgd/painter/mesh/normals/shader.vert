#version 300 es

precision mediump float;

uniform mat4 uniModelViewMatrix;
uniform mat4 uniProjectionMatrix;
/**
 * Positon and normal.
 */
in vec4 attPosition;
in vec3 attNormal;

out vec3 varNormal;

void main() {
    varNormal = attNormal;
    gl_Position = uniProjectionMatrix * uniModelViewMatrix * attPosition;
}

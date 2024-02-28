#version 300 es

precision mediump float;

uniform mat4 uniModelViewMatrix;
uniform mat4 uniProjectionMatrix;
/**
 * Positon and normal.
 */
in vec3 attPosition;
in vec3 attNormal;

out vec3 varNormal;

void main() {
    varNormal = mat3(uniModelViewMatrix) * attNormal;
    gl_Position = uniProjectionMatrix * uniModelViewMatrix *vec4(attPosition, 1.0);
}

#version 300 es

precision mediump float;

uniform mat4 uniModelViewMatrix;
uniform mat4 uniProjectionMatrix;
uniform float uniSize;
/**
 * Positon and normal.
 */
in vec3 attPosition;


void main() {
    gl_Position = uniProjectionMatrix * uniModelViewMatrix *vec4(attPosition, 1.0);
    gl_PointSize = uniSize;
}

#version 300 es

#ifdef GL_FRAGMENT_PRECISION_HIGH
precision highp float;
#else
precision mediump float;
#endif

uniform mat4 uniModelViewMatrix;
uniform mat4 uniProjectionMatrix;
uniform float uniSize;
/**
 * Positon and normal.
 */
in vec4 attPosition;


void main() {
    gl_Position = uniProjectionMatrix * uniModelViewMatrix * attPosition;
    gl_PointSize = uniSize;
    if (attPosition.x == 0.0) gl_PointSize *= 5.0;
}

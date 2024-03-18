#version 300 es

precision mediump float;

uniform mat4 uniModelViewMatrix;
uniform mat4 uniProjectionMatrix;
uniform float uniScreenHeight;

/**
 * Position of the tip.
 */
in vec4 attPos;
in vec2 attUV;

out vec2 varUV;

void main() {
    varUV = attUV;
    vec4 point = uniModelViewMatrix * attPos;
    gl_Position = uniProjectionMatrix * point;
    point.y += 0.3;
    point = uniProjectionMatrix * point;
    gl_PointSize = uniScreenHeight * abs(gl_Position.y / gl_Position.w - point.y / point.w);
}

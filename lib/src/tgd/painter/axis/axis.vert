#version 300 es

precision mediump float;

uniform vec4 uniTS;
uniform mat4 uniModelViewMatrix;
uniform mat4 uniProjectionMatrix;

in vec3 attPos;
in vec4 attColor;

out vec4 varColor;

void main() {
    varColor = attColor;
    vec3 translate = uniTS.xyz;
    float scale = uniTS.w;
    gl_Position = uniProjectionMatrix 
        * uniModelViewMatrix 
        * vec4(attPos * scale + translate, 1.0);
}

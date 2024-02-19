#version 300 es

precision mediump float;

uniform sampler2D uniTexture;

in vec2 varUV;
out vec4 FragColor;


void main() {
    vec2 uv = varUV + gl_PointCoord * vec2(0.333333333, 0.5);
    FragColor = texture(uniTexture, uv);
    if (FragColor.w < 1.0) {
        discard;
    }
}

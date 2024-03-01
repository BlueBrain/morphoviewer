#version 300 es

precision mediump float;

uniform sampler2D uniTexture;
uniform vec4 uniColor;

in vec2 varUV;
out vec4 FragColor;

void main() {
    vec4 color = texture(uniTexture, varUV);
    float alpha = color.r * uniColor.a;
    FragColor = vec4(
        uniColor.rgb,
        alpha
    );
}

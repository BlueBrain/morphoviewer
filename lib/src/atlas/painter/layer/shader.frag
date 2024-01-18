#version 300 es

precision mediump float;

uniform sampler2D uniTexture;
uniform vec4 uniColor;
uniform float uniSmoothness;
uniform float uniHighlight;

in vec2 varUV;
out vec4 FragColor;

const vec3 WHITE = vec3(1,1,1);

void main() {
    vec4 color = texture(uniTexture, varUV);
    float alpha = color.r * uniColor.a;
    float smoothness = smoothstep(1.0 - uniSmoothness, 1.0, alpha);
    alpha *= 1.0 - smoothness;
    FragColor = vec4(
        uniColor.rgb + (uniHighlight * smoothness),
        alpha
    );
}

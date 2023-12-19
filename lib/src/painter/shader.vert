#version 300 es

precision mediump float;

uniform sampler2D uniTexture;
uniform mat4 uniModelViewMatrix;
uniform mat4 uniProjectionMatrix;
uniform float uniAspect;
uniform float uniRadiusMultiplier;
uniform float uniRadiusAdditioner;
uniform float uniOutline;
uniform float uniLightness;
uniform float uniZFight;
in vec4 attAxyzr;
in vec4 attBxyzr;
in vec2 attAuv;
in vec2 attBuv;
in float attAinfluence;
in float attBinfluence;
in float attCenter;
in vec2 attOffset;
out vec3 varColor;

const float EPSILON = 1e-5;

float scaleRadius(float radius, float influence) {
    float multiplier = mix(1.0, uniRadiusMultiplier, influence);
    float additioner = uniRadiusAdditioner * influence;
    return (radius * multiplier + additioner) * mix(1.0, uniOutline, influence);
}

vec2 safeNormalize(vec2 v) {
    float len2 = dot(v, v);
    if (len2 < 1e-6) return vec2(0, 1);

    return inversesqrt(len2) * v;
}

void main() {
    vec2 uv = attCenter == 0.0 ? attAuv : attBuv;
    varColor = texture(uniTexture, uv).rgb * uniLightness;

    vec4 cameraA = uniModelViewMatrix * vec4(attAxyzr.xyz, 1.0);
    vec4 screenA = uniProjectionMatrix * cameraA;
    vec4 cameraB = uniModelViewMatrix * vec4(attBxyzr.xyz, 1.0);
    vec4 screenB = uniProjectionMatrix * cameraB;
    // Is A or B the center here?
    vec4 center = attCenter == 0.0 ? screenA : screenB;
    float radius = attCenter == 0.0 
        ? scaleRadius(attAxyzr.w, attAinfluence) 
        : scaleRadius(attBxyzr.w, attBinfluence);
    // 2D Axis in screen space: screenAxisY is aligned with the segment
    // from A to B.
    vec2 screenAxisY = safeNormalize(screenB.xy / screenB.z - screenA.xy / screenA.z) * radius;
    vec2 screenAxisX = vec2(screenAxisY.y, -screenAxisY.x);
    // Each point is offset from a center.
    // This allows thickness variation in the shader.
    vec2 screenOffset = attOffset.x * screenAxisX + attOffset.y * screenAxisY;
    center.x += screenOffset.x;
    center.y += screenOffset.y * uniAspect;
    // Prevent Z fight.
    center.z += uniZFight * EPSILON; // EPSILON * (attCenter + uniZFight);
    gl_Position = center;
}

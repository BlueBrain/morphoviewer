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
/**
 * Positoon of center A, plus radius.
 */
in vec4 attAxyzr;
/**
 * Positoon of center B, plus radius.
 */
in vec4 attBxyzr;
in vec2 attAuv;
in vec2 attBuv;
in float attAinfluence;
in float attBinfluence;
/**
 * 0.0: we are using center A.
 * 1.0: we are using center B.
 */
in float attCenter;
/**
 * Position of the point relative to the current center.
 */
in vec2 attOffset;
out vec3 varColor;

const float EPSILON = 1e-5;

float scaleRadius(float radius, float influence) {
    float multiplier = mix(1.0, uniRadiusMultiplier, influence);
    float additioner = uniRadiusAdditioner * influence;
    return (radius * multiplier + additioner) * mix(1.0, uniOutline, influence);
}

vec3 safeNormalize(vec3 v) {
    float len2 = dot(v, v);
    if (len2 < 1e-6) return vec3(0, 1, 0);

    return inversesqrt(len2) * v;
}

void main() {
    vec2 uv = attCenter == 0.0 ? attAuv : attBuv;
    varColor = texture(uniTexture, uv).rgb * uniLightness;

    vec3 vecRadius = vec3(
        0.0,
        attCenter == 0.0 
            ? scaleRadius(attAxyzr.w, attAinfluence) 
            : scaleRadius(attBxyzr.w, attBinfluence), 
        0.0
    );
    vec4 cameraA = uniModelViewMatrix * vec4(attAxyzr.xyz, 1.0);
    vec4 cameraB = uniModelViewMatrix * vec4(attBxyzr.xyz, 1.0);
    vec4 cameraC = attCenter == 0.0 ? cameraA : cameraB;
    vec3 cameraAxisY = (cameraB - cameraA).xyz;
    cameraAxisY.z = 0.0;
    cameraAxisY = safeNormalize(cameraAxisY);
    vec3 cameraAxisX = vec3(
        -cameraAxisY.y,
        cameraAxisY.x,
        cameraAxisY.z
    );
    float radius = attCenter == 0.0 
            ? scaleRadius(attAxyzr.w, attAinfluence) 
            : scaleRadius(attBxyzr.w, attBinfluence);
    vec3 cameraPoint = cameraC.xyz + radius * (
        attOffset.x * cameraAxisX
        + attOffset.y * cameraAxisY
    );
    vec4 screenPoint = uniProjectionMatrix * vec4(cameraPoint, 1.0);
    screenPoint.z += uniZFight * EPSILON;
    gl_Position = screenPoint;
}

#version 300 es

precision mediump float;

uniform sampler2D uniTexture;
uniform mat4 uniModelViewMatrix;
uniform mat4 uniProjectionMatrix;
// Minimal value for the radius.
uniform float uniMinRadius;
// Multiply all radii by this value.
uniform float uniRadiusMultiplier;
// When uniRadiusSwitch == 1.0,
// we use uniRadiusConstant as radius. 
uniform float uniRadiusConstant;
// 0.0 means we will use the radius defined
// in the attribute attAxyzr or attBaxyz.
// 1.0 means we use uniRadiusConstant for
// all vertices.
uniform float uniRadiusSwitch;
// Multiply the color by this value;
uniform float uniLight;
// Push the segments away from camera of `uniShiftZ`.
// This can be used if you want contours on the segments:
// just increase `uniRadiusMultiplier`, set a low `uniLight`,
// and set a small positive `uniShiftZ`.
uniform float uniShiftZ;

//===================
// Vertex attributes
//-------------------

// Position of the vertex, relative to
// the current center and assuming a
// radius of 1.
// Z tells you what tip is your center: 0 for A and 1 for B.
in vec3 attOffset;

//=====================
// Instance attributes
//---------------------

// Coords and radious of tip A.
in vec4 attAxyzr;
// Coords and radious of tip B.
in vec4 attBxyzr;
// The color is taken from a texture.
in vec2 attAuv;
in vec2 attBuv;
// 0 means that nothing modifies the initial radius,
// except the minRadius.
in float attAinfluence;
in float attBinfluence;


out vec4 varColor;


vec3 worldToCamera(vec3 v);
float getRadius(float tip);
mat3 getTransfoMatrix(float tip, vec3 camA, vec3 camB);

void main() {
    vec3 camA = worldToCamera(attAxyzr.xyz);
    vec3 camB = worldToCamera(attBxyzr.xyz);
    float tip = attOffset.z;
    vec2 uv = mix(attAuv, attBuv, tip);
    varColor = texture(uniTexture, uv)
        *   vec4(uniLight, uniLight, uniLight, 1.0);
    float radius = getRadius(tip);
    mat3 transfo = getTransfoMatrix(tip, camA, camB);
    vec3 point = transfo * vec3(attOffset.xy * radius, 1.0);
    point.z -= uniShiftZ;
    gl_Position = 
        uniProjectionMatrix 
        * vec4(point, 1);
}

float getRadius(float tip) {
    float influence = mix(attAinfluence, attBinfluence, tip);
    float originalRadius = mix(
        attAxyzr.w,
        attBxyzr.w,
        tip
    );
    float modifiedRadius = mix(
        originalRadius,
        uniRadiusConstant,
        uniRadiusSwitch
    ) * uniRadiusMultiplier;
    float radius = mix(
        originalRadius,
        modifiedRadius,
        influence
    );
    return max(uniMinRadius, radius);
}

vec3 worldToCamera(vec3 v) {
    vec4 result = uniModelViewMatrix * vec4(v, 1.0);
    return result.xyz;
}

mat3 getTransfoMatrix(float tip, vec3 camA, vec3 camB) {
    // What is the current tip?
    vec3 camO = mix(camA, camB, tip);
    vec2 A = camA.xy;
    vec2 B = camB.xy;
    vec3 Y = vec3(
        A == B ? vec2(0, 1) : normalize(A - B),
        0
    );
    vec3 X = vec3(Y.y, -Y.x, 0);
    return mat3(X, Y, camO);
}
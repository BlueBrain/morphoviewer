/**
 * This is the resting shape of a capsule in Wavefromnt format (*.obj).
 *
 * * Z coordinate must always be 0.
 * * Two points are mandatory: (0, +1) and (0, -1).
 * * The other points must be on a circle of radius 1 with
 * the center ar (0, +1) or (0, -1).
 * * Faces must all be triangles.
 */
export const WavefrontCapsuleContent = `# Blender 4.0.1
# www.blender.org
o Circle
v 0.000000 2.000000 0.000000
v -0.500000 1.866025 0.000000
v -0.866025 1.500000 0.000000
v -1.000000 1.000000 0.000000
v -0.500000 -1.933013 0.000000
v -0.866025 -1.566987 0.000000
v -1.000000 -1.066987 0.000000
v 1.000000 -1.066987 0.000000
v 0.866025 -1.566987 0.000000
v 1.000000 1.000000 0.000000
v 0.866025 1.500000 0.000000
v 0.500000 1.866025 0.000000
v 0.500000 -1.933013 0.000000
v -0.000000 -2.066987 0.000000
v 0.000000 1.000000 0.000000
v 0.000000 -1.066987 0.000000
s 0
f 3 15 4
f 2 15 3
f 1 15 2
f 12 15 1
f 11 15 12
f 10 15 11
f 9 16 8
f 13 16 9
f 14 16 13
f 5 16 14
f 6 16 5
f 7 16 6
f 4 16 7
f 4 15 16
f 16 15 8
f 15 10 8
`

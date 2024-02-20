interface Vertex {
    point: number
}

export class TgdMesh {
    /**
     * [x0, y0, z0, x1, y1, z1, ...]
     */
    private readonly points: number[] = []
    private pointsIndex = 0

    /**
     * Do not confuse Point and Vertex.
     * A vertex is mapped to one point,
     * but a point can be mapped to several vertices.
     * @returns Index of the new point.
     */
    addPoint(x: number, y: number, z: number): number {
        const index = this.pointsIndex++
        this.points.push(x, y, z)
        return index
    }

    getPointX(index: number): number {
        return this.points[index * 3 + 0]
    }
    getPointY(index: number): number {
        return this.points[index * 3 + 1]
    }
    getPointZ(index: number): number {
        return this.points[index * 3 + 2]
    }

    get pointsCount() {
        return Math.floor(this.pointsIndex / 3)
    }

    findPointCloseTo(x: number, y: number, z: number, epsilon = 1e-6): number {
        const count = this.pointsCount
        for (let i = 0; i < count; i++) {
            if (!near(x, this.getPointX(i), epsilon)) continue
            if (!near(y, this.getPointY(i), epsilon)) continue
            if (!near(z, this.getPointZ(i), epsilon)) continue

            return i
        }
        return -1
    }
}

function near(a: number, b: number, epsilon: number) {
    return Math.abs(a - b) < epsilon
}

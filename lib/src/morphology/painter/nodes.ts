import { CellNode } from "@/parser/swc"
import { CellNodeType } from "@/types"
import { Vector3 } from "@/webgl2/calc"
import { vec3 } from "gl-matrix"

export interface Branch {
    node: CellNode
    children: Branch[]
}

export class CellNodes {
    public readonly nodeTypes: number[]
    public readonly averageRadius: number
    public readonly center: Vector3
    public readonly bbox: Vector3
    public readonly tree: Branch

    private readonly nodesByIndex = new Map<number, CellNode>()

    constructor(private readonly nodes: CellNode[]) {
        let totalRadius = 0
        let countRadius = 0
        nodes.forEach(node => {
            if (node.type !== CellNodeType.Soma) {
                totalRadius += node.radius
                countRadius++
            }
            this.nodesByIndex.set(node.index, node)
        })
        this.averageRadius = countRadius === 0 ? 0 : totalRadius / countRadius
        const setNodeTypes = new Set<number>()
        nodes.forEach(node => {
            setNodeTypes.add(node.type)
            if (node.radius === 0) node.radius = this.averageRadius
        })
        const { center, bbox } = computeNodesCenterAndBBox(nodes)
        this.center = center
        this.bbox = bbox
        this.tree = this.buildTree()
        this.nodeTypes = Array.from(setNodeTypes)
    }

    getByIndex(index: number): CellNode | undefined {
        return this.nodesByIndex.get(index)
    }

    forEach(callback: (node: CellNode, index: number) => void) {
        this.nodes.forEach(callback)
    }

    computeDistancesFromSoma(): number {
        const { nodes } = this
        const mapNodes = new Map<number, CellNode>()
        const mapDistances = new Map<number, number>()
        nodes.forEach(node => mapNodes.set(node.index, node))
        let maxDist = 0
        nodes.forEach(node => {
            const dist = computeDistanceFromSoma(node, mapNodes, mapDistances)
            node.u = dist
            maxDist = Math.max(maxDist, dist)
        })
        if (maxDist === 0) return 0

        // Normalize U coordinate.
        // 1.0 will be the further from the soma.
        const factor = 1 / maxDist
        nodes.forEach(node => (node.u *= factor))
        return maxDist
    }

    private buildTree(): Branch {
        const { nodes } = this
        if (nodes.length === 0) throw Error("There are no nodes in this file!")

        let [root] = nodes
        const branches = new Map<number, Branch>()
        nodes.forEach(node => {
            const branch: Branch = { node, children: [] }
            branches.set(node.index, branch)
            if (node.parent === -1) {
                root = node
            } else if (node.index === node.parent) {
                console.error(`Node #${node.index} has itself has a parent!`)
            } else {
                const parent = branches.get(node.parent)
                if (parent) {
                    parent.children.push(branch)
                } else {
                    console.error(
                        `Node #${node.index} has #${node.parent} as a parent, which is not yet defined!`
                    )
                }
            }
        })
        const tree = branches.get(root.index)
        if (!tree) {
            throw Error(
                "Impossible error! There must be a bug in CellNodes.buildTree()."
            )
        }
        return tree
    }
}

function computeDistanceFromSoma(
    node: CellNode,
    mapNodes: Map<number, CellNode>,
    mapDistances: Map<number, number>
): number {
    // Root has a distance of 0 from the Soma.
    if (node.parent < 0) return 0

    if (mapDistances.has(node.index))
        return mapDistances.get(node.index) as number

    const parent = mapNodes.get(node.parent)
    // Should never be the case, but if we are not
    // linked to the soma, the distance is 0.
    if (!parent) return 0

    const dx = parent.x - node.x
    const dy = parent.y - node.y
    const dz = parent.z - node.z
    const dist =
        Math.sqrt(dx * dx + dy * dy + dz * dz) +
        computeDistanceFromSoma(parent, mapNodes, mapDistances)
    mapDistances.set(node.index, dist)
    return dist
}

function computeNodesCenterAndBBox(nodes: CellNode[]) {
    const [firstNode] = nodes
    if (!firstNode)
        throw Error(
            "Unable to compute bounding box because the nodes array is empty!"
        )

    const center = vec3.fromValues(firstNode.x, firstNode.y, firstNode.z)
    const min = vec3.clone(center)
    const max = vec3.clone(center)
    const average = vec3.clone(center)
    let somaCount = 1
    for (const { x, y, z, radius, index, type, parent } of nodes) {
        if (index === firstNode.index) continue

        const point = vec3.fromValues(x, y, z)
        if (parent === -1) vec3.copy(center, point)
        if (type === CellNodeType.Soma) {
            vec3.add(average, average, point)
            somaCount++
        }
        min[0] = Math.min(min[0], point[0] - radius)
        max[0] = Math.max(max[0], point[0] + radius)
        min[1] = Math.min(min[1], point[1] - radius)
        max[1] = Math.max(max[1], point[1] + radius)
        min[2] = Math.min(min[2], point[2] - radius)
        max[2] = Math.max(max[2], point[2] + radius)
    }
    vec3.scale(average, average, 1 / somaCount)
    vec3.subtract(min, min, average)
    vec3.subtract(max, max, average)
    return {
        center: [...average] as Vector3,
        bbox: [
            Math.max(Math.abs(min[0]), Math.abs(max[0])),
            Math.max(Math.abs(min[1]), Math.abs(max[1])),
            Math.max(Math.abs(min[2]), Math.abs(max[2])),
        ] as Vector3,
    }
}

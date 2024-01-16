import { AtlasMesh, AtlasMeshOptions, AtlasMeshStatus } from "./atlas-mesh"
import { AbstractPainter } from "../abstract-painter"
import { Wgl2Resources } from "@/webgl2/resources/resources"
import { MeshPainter } from "./painter/mesh/mesh-painter"
import { Wgl2CameraOrthographic } from "@/webgl2/camera"

export class AtlasPainter extends AbstractPainter {
    private readonly meshes = new Map<string, AtlasMesh>()

    constructor(
        private readonly waveFrontMeshLoader: (id: string) => Promise<string>
    ) {
        super()
    }

    showMesh(id: string, options: Partial<AtlasMeshOptions> = {}) {
        const { meshes, resources } = this
        const currentMesh = meshes.get(id) ?? {
            id,
            content: "",
            visible: true,
            status: AtlasMeshStatus.ToLoad,
            color: [1, 1, 1, 1],
        }
        const mesh: AtlasMesh = {
            ...currentMesh,
            ...options,
        }
        if (resources && mesh.status === AtlasMeshStatus.ToLoad) {
            mesh.status = AtlasMeshStatus.Loading
            this.waveFrontMeshLoader(id)
                .then((content: string) => {
                    const painter = new MeshPainter(resources, content)
                    mesh.paint = painter.paint
                    this.refresh()
                })
                .catch(ex => console.error(`Unable to load mesh "${id}"!`, ex))
        }
        meshes.set(id, mesh)
    }

    hideMesh(id: string) {
        const mesh = this.meshes.get(id)
        if (mesh) mesh.visible = false
    }

    protected init() {
        const { resources, camera } = this
        if (!resources) return

        resources.gl.clearColor(0, 0, 0, 1)
        camera.target.set([6794.469999999999, 5911.9, 5692.875])
        if (camera instanceof Wgl2CameraOrthographic) {
            camera.height.set(5000)
        }
    }

    protected readonly paint = (resources: Wgl2Resources, time: number) => {
        const { gl } = resources
        gl.enable(gl.DEPTH_TEST)
        gl.clearDepth(1)
        gl.depthFunc(gl.LESS)
        gl.depthMask(true)
        gl.depthRange(0, 1)
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
        this.meshes.forEach(mesh => mesh.paint?.(this.camera, mesh, time))
    }
}

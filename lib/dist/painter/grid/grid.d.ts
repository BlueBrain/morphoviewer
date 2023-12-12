import { Wgl2Camera } from "@/webgl2/camera/camera";
import { Wgl2Resources } from "@/webgl2/resources/resources";
export declare class Grid {
    private readonly res;
    private readonly camera;
    x: number;
    y: number;
    z: number;
    private readonly count;
    private gl;
    private prg;
    private vao;
    private locations;
    constructor(res: Wgl2Resources, camera: Wgl2Camera);
    paint(): void;
}
//# sourceMappingURL=grid.d.ts.map
import { TgdProgram, TgdProgramOptions } from "@tgd/types"
import { TgdResource } from "./resource"
import { TgdProgramImpl } from "@tgd/program"

export class TgdResourceProgram extends TgdResource<
    TgdProgramOptions,
    TgdProgram
> {
    constructor(public readonly gl: WebGL2RenderingContext) {
        super()
    }

    protected actualCreate(input: TgdProgramOptions): TgdProgram {
        return new TgdProgramImpl(this.gl, input)
    }

    protected actualDelete(program: TgdProgram): void {
        if (program instanceof TgdProgramImpl) program.delete()
    }

    protected makeKeyFromInput(input: TgdProgramOptions): string {
        return JSON.stringify(input)
    }
}

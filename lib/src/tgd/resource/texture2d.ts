import { TgdResource } from "@tgd/resource/resource"
import { TgdTexture2DImpl } from "@tgd/texture"
import {
    TgdTexture2D,
    TgdTexture2DOptions,
    TgdContextInterface,
} from "@tgd/types"

export class TgdResourceTexture2D extends TgdResource<
    Partial<TgdTexture2DOptions>,
    TgdTexture2D
> {
    constructor(private readonly context: TgdContextInterface) {
        super()
    }

    getDefaultEmpty(): TgdTexture2D {
        return this.create({ width: 1, height: 1 }, "@tgd/DefaultTexture2D")
    }

    protected actualCreate(
        input: Partial<TgdTexture2DOptions>,
        id: string
    ): TgdTexture2D {
        return new TgdTexture2DImpl(this.context, id, input)
    }

    protected actualDelete(object: TgdTexture2D): void {
        if (object instanceof TgdTexture2DImpl) object.delete()
    }
}

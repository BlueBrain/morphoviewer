export abstract class TgdPainter {
    public active: boolean = true

    abstract delete(): void

    abstract paint(time: number, delay: number): void
}

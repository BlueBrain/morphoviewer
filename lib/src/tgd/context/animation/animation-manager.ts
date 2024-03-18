import { TgdAnimation } from "@tgd/types/animation"

interface Animation {
    start: number
    duration: number
    inverseDuration: number
    action(this: void, t: number): void
    loop: number
    repeat: number
    cancel(this: void): void
}

export class TgdManagerAnimation {
    private readonly animations = new Map<TgdAnimation, Animation>()

    schedule(animation: TgdAnimation): TgdAnimation {
        const { action, duration, easingFunction, repeat } = animation
        this.animations.set(animation, {
            start: -1,
            duration: duration,
            inverseDuration: 1 / duration,
            action: easingFunction
                ? (alpha: number) => action(easingFunction(alpha))
                : action,
            loop: 1,
            repeat: repeat ?? 1,
            cancel: () => this.cancel(animation),
        })
        return animation
    }

    cancel(animation: TgdAnimation) {
        this.animations.delete(animation)
    }

    paint(time: number): boolean {
        if (this.animations.size === 0) return false

        for (const anim of this.animations.values()) {
            if (anim.start < 0) {
                // Initialize animation.
                anim.start = time
            }
            const t = Math.min(1, anim.inverseDuration * (time - anim.start))
            anim.action(t)
            if (time > anim.start + anim.duration) {
                anim.loop++
            }
            if (anim.loop > anim.repeat) {
                anim.cancel()
            }
        }
        return true
    }
}

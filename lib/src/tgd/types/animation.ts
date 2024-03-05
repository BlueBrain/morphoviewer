export interface TgdAnimation {
    /**
     * @param alpha Value between 0 and 1
     */
    action(this: void, alpha: number): void
    /**
     * Duration of the animation in milliseconds.
     */
    duration: number
    /**
     * number of times the animation should repeat.
     * Default to 1.
     */
    repeat?: number
    /**
     * Default to linear.
     */
    easingFunction?(this: void, x: number): number
}

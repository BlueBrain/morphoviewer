import type * as CSS from "csstype"

declare module "csstype" {
    interface Properties {
        // Allow namespaced CSS Custom Properties
        [index: `--theme-${string}` | `--custom-${string}`]: any
    }
}

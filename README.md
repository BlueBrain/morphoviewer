# morphoviewer

<p align="center">
  <a href="https://www.epfl.ch/research/domains/bluebrain/">Blue Brain Project</a> |
  <a href="https://bluebrainnexus.io">Nexus</a> |
  <a href="https://bluebrainnexus.io/docs/">Nexus API Docs</a> |
  <a href="https://sandbox.bluebrainnexus.io">Sandbox</a>
</p>

## Usage

```tsx
import React from "react"
import { ColoringType, MorphologyPainter } from "morphoviewer"

export default functon MyViewer({ swc }: { swc: string }) {
    const refPainter = React.useRef(new MorphologyPainter())
    React.useEffect(
        () => {
            refPainter.swc = swc
        },
        [swc]
    )
    return <canvas ref={(canvas) => refPainter.canvas = canvas} />
}
```

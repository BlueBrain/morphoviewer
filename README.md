# morphoviewer

<p align="center">
  <a href="https://www.epfl.ch/research/domains/bluebrain/">Blue Brain Project</a> |
</p>

## Usage

```tsx
import React from "react"
import { MorphologyCanvas } from "@bbp/morphoviewer"

export default functon MyCellViewer({ swc }: { swc: string }) {
    const refPainter = React.useRef(new MorphologyCanvas())
    React.useEffect(
        () => {
            refPainter.current.swc = swc
        },
        [swc]
    )
    return <canvas ref={(canvas) => refPainter.canvas = canvas} />
}
```

## Utils

### `colorContrast(background: string, ...colors: string[]): string`

Returns the element from `colors` that has the better contrast
with `background`.

This can be handy if you need to overlay text on the canvas.

The alpha will be ignored for `background`, but not for `colors`.

## AtlasPainter

```ts
const painter = new AtlasPainter()
```

## MorphologyPainter

```ts
const painter = new MorphologyPainter()
```

### `painter.colors`

Define the colors of the background and the different sections of the cell in CSS style.

```ts
painter.colors.soma = "#ef558a"
painter.colors.apicalDendrite = "rgb(32, 88, 150)"
```

### `painter.eventColorsChange`

This event is dispatched anytime a color is changed by setting any
attribute of `painter.colors`.

### `painter.eventMouseWheelWithoutCtrl`

The mouse wheel is used to zoom in/out. But if the viewer is embeded in a long page, this behavior can prevent the page from scrolling and frustrate the user.

That's why, if the viewer is not in fullscreen mode, the zoom will only work if the user holds `Control` key while mouse wheeling. This event is dispatched if an attempt to use the mouse wheel without holding `Control` is detected in non fullscreen mode.

### `painter.minRadius`

When dendrites are very long and very thin, they can start to disappear. That's why the painter has a minimal radius for them to keep them always visible.

Default value is **1** pixel.

### `painter.toggleFullscreen()`

Toggle the associated canvas in fullscreen mode.

### `painter.resetCamera()`

The camera will target the soma and the zoom will be set as to see the whole cell. It will face the Z axis of the morphology, with the Y axis looking to the top.

### `painter.pixelScale` (readonly)

Returns the space size of a screen pixel. This can be used to compute a scale bar.

See `painter.eventPixelScaleChange`.

### `painter.eventPixelScaleChange`

This event is dispatched every time `painter.pixelScale` changes.

### `painter.computeScalebar(options)`

**Input**:

```ts
options: Partial<{
    preferedSizeInPixels: number
    units: Record<string, number>
    values: number[]
}>
```

* `preferedSizeInPixels`: The scalebar's size we target. Depending on the constaints, the scalebar actual size can be different. Default to **240** pixels.
* `units`: The units we are allowd to use and their scale against the default space unit. Default to **`{ nm: 1e-3, µm: 1, mm: 1e3, m: 1e6, km: 1e9 }`**.
* `values`: The rounded values we are allowed to use. This will prevent the scalebar from displaying something like `27.1542 mm`. Default to **`[1, 2, 5, 10, 20, 25, 50, 75, 100, 200, 300, 400, 500, 600, 700, 800, 900]`**.

**Output**:

```ts
{
    sizeInPixel: number
    value: number
    unit: string
}
```

* `sizeInPixel`: Actual size of the scalebar computed for the resulting `value` and `unit`.
* `value`: Numerical value to display.
* `unit`: Unit of expression of `value`.

### `painter.colorBy`

A string enum that defines how the cell must be colored.

* `"section"`: Use `painter.colors` to color the soma, axon ans dendrites.
* `"distance"`: Use a gradient (green, yello, red) to show the distance from the soma. Red is the farest point from the soma.

### `painter.radiusType`

A float between 0 and 1 to know how to interpret radius information from the SWC file.

* `0`: Variable radius (default).
* `1`: Constant radius.

In real life, dendrites tend to be thicker near to the soma and become thiner at the end. Trees in the woods behave like this too.

Setting `0` will give you the real radius. And the 1 will set the same radius everywhere (a constant one that is the average of all the values).

If needed, to temper the effect, you can set any value between 0 and 1 to get an interpolation.

### `painter.canvas`

The canvas onto display the 3D cell.

### `painter.swc`

The string content of a [SWC]([Title](https://swc-specification.readthedocs.io/en/latest/swc.html)) file that describes the tree structure of the current cell.

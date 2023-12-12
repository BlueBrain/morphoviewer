# MorphologyPainter

## How to render a soma?

Specs comes from:

- [NeuroMorpg.org](https://neuromorpho.org/SomaFormat.html)
- [MorphIO](https://morphio.readthedocs.io/en/latest/specification.html#soma)

The soma is defined by nodes with type of **1**.
The **root node** is the one with a parent of **-1**.
The rendering depends on the number of such nodes.

### 1 node

The soma is a sphere with the radius of the node.

### 2 nodes

The soma is a capsule between these two nodes.

### 3 nodes

- Let be `(x,y,z)` the coordinates of the root.
- Let be `r` the average distance from all the soma nodes to the root.

The soma is a capsule from `(x, y + r, z)` to `(x, y - r, z)` with `r` as the radius on both ends.

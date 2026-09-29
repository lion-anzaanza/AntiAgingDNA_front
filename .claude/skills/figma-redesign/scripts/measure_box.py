"""Measure one small element (a chip, a card edge) in a Figma export and a device screenshot.

compare_bands.py finds rows of ink across the screen, which misses near-white
elements on the pale v4 background. This looks inside one window instead and
reports the bounding box of anything that differs from the background, in
Figma points, for both images.

usage: measure_box.py FIGMA.png DEVICE.png X0 Y0 X1 Y1 [--offset 24.8]
       [--bg f6f3fa] [--threshold 30] [--figma-scale 4] [--frame-width 220]

X0..Y1 is the window in Figma frame points. --offset is the screen's
compare_bands consensus: the device window is the Figma window moved up by it.
"""

import argparse

import numpy as np
from PIL import Image


def box(path, ppt, x0, y0, x1, y1, bg, threshold):
    im = np.asarray(Image.open(path).convert("RGB")).astype(int)
    win = im[int(y0 * ppt) : int(y1 * ppt), int(x0 * ppt) : int(x1 * ppt)]
    mask = np.abs(win - np.array(bg)).sum(2) > threshold
    ys, xs = np.where(mask)
    if not len(xs):
        return None
    return (x0 + xs.min() / ppt, y0 + ys.min() / ppt, x0 + (xs.max() + 1) / ppt, y0 + (ys.max() + 1) / ppt)


def main():
    p = argparse.ArgumentParser()
    p.add_argument("figma")
    p.add_argument("device")
    p.add_argument("x0", type=float)
    p.add_argument("y0", type=float)
    p.add_argument("x1", type=float)
    p.add_argument("y1", type=float)
    p.add_argument("--offset", type=float, default=24.8)
    p.add_argument("--bg", default="f6f3fa")
    p.add_argument("--threshold", type=int, default=30)
    p.add_argument("--figma-scale", type=float, default=4)
    p.add_argument("--frame-width", type=float, default=220)
    a = p.parse_args()

    bg = tuple(int(a.bg[i : i + 2], 16) for i in (0, 2, 4))
    dppt = Image.open(a.device).width / a.frame_width
    f = box(a.figma, a.figma_scale, a.x0, a.y0, a.x1, a.y1, bg, a.threshold)
    d = box(a.device, dppt, a.x0, a.y0 - a.offset, a.x1, a.y1 - a.offset, bg, a.threshold)
    for name, b in (("figma", f), ("device", d)):
        if b is None:
            print(f"{name:6}: nothing in the window")
        else:
            print(f"{name:6}: x {b[0]:.2f}-{b[2]:.2f}  y {b[1]:.2f}-{b[3]:.2f}  size {b[2] - b[0]:.2f}x{b[3] - b[1]:.2f}")
    if f and d:
        print(f"device - figma: left {d[0] - f[0]:+.2f}  top {d[1] + a.offset - f[1]:+.2f}  "
              f"width {(d[2] - d[0]) - (f[2] - f[0]):+.2f}  height {(d[3] - d[1]) - (f[3] - f[1]):+.2f}")


if __name__ == "__main__":
    main()

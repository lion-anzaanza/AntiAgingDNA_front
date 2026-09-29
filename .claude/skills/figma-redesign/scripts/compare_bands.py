"""Compare vertical element positions between a Figma export and a device screenshot.

Finds horizontal bands of "ink" (pixels that differ from the background) in each
image, converts them to Figma points, pairs them in order and prints the offset.
A consistent offset is just the status-bar difference; a band that disagrees with
the consensus is a layout bug candidate.

usage: compare_bands.py FIGMA.png DEVICE.png [--bg f6f3fa] [--figma-scale 4]
                        [--frame-width 220] [--x-range 0 175] [--threshold 60]
                        [--figma-top 39] [--device-top 12]
"""

import argparse
import statistics

import numpy as np
from PIL import Image


def bands(path, ppt, top_pt, bg, x_range, threshold):
    im = np.asarray(Image.open(path).convert("RGB")).astype(int)
    x0, x1 = (int(v * ppt) for v in x_range)
    diff = np.abs(im[:, x0:x1, :] - np.array(bg)).sum(2)
    ink = (diff > threshold).sum(1) > 2
    out, start = [], None
    for y in range(int(top_pt * ppt), im.shape[0]):
        if ink[y] and start is None:
            start = y
        elif not ink[y] and start is not None:
            if y - start > 2:
                out.append((start / ppt, y / ppt))
            start = None
    return out


def main():
    p = argparse.ArgumentParser()
    p.add_argument("figma")
    p.add_argument("device")
    p.add_argument("--bg", default="f6f3fa", help="background hex, no #")
    p.add_argument("--figma-scale", type=float, default=4)
    p.add_argument("--frame-width", type=float, default=220)
    p.add_argument("--x-range", type=float, nargs=2, default=(0, 175), metavar=("X0", "X1"),
                   help="only look at columns X0..X1 (pt)")
    p.add_argument("--threshold", type=int, default=60,
                   help="RGB distance that counts as ink; lower it to catch white cards")
    p.add_argument("--figma-top", type=float, default=39, help="skip the PhoneHeader mock (pt)")
    p.add_argument("--device-top", type=float, default=12, help="skip the status bar (pt)")
    a = p.parse_args()

    bg = tuple(int(a.bg[i : i + 2], 16) for i in (0, 2, 4))
    device_ppt = Image.open(a.device).width / a.frame_width
    f = bands(a.figma, a.figma_scale, a.figma_top, bg, a.x_range, a.threshold)
    d = bands(a.device, device_ppt, a.device_top, bg, a.x_range, a.threshold)

    offsets = []
    print(f"{'figma':>15} {'device':>15} {'offset':>7}")
    for (ft, fb), (dt, db) in zip(f, d):
        offsets.append(ft - dt)
        print(f"{ft:6.1f}-{fb:6.1f}  {dt:6.1f}-{db:6.1f}  {ft - dt:7.1f}")
    if len(f) != len(d):
        print(f"band count differs: figma {len(f)}, device {len(d)} - pairing may be off")
    if offsets:
        med = statistics.median(offsets)
        print(f"consensus (median) {med:.1f}")
        for (ft, _), o in zip(f, offsets):
            if abs(o - med) > 1:
                print(f"  outlier at figma y={ft:.1f}: {o - med:+.1f}pt from consensus")


if __name__ == "__main__":
    main()

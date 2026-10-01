"""Compare vertical element positions between a Figma export and a device screenshot.

Finds horizontal bands of "ink" (pixels that differ from the background) in each
image, converts them to Figma points, pairs them in order and prints the offset.
A consistent offset is just the status-bar difference; a band that disagrees with
the consensus is a layout bug candidate.

usage: compare_bands.py FIGMA.png DEVICE.png [--bg fbf9fd] [--figma-scale 4]
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
    p.add_argument("--bg", default="fbf9fd", help="background hex, no #")
    p.add_argument("--figma-scale", type=float, default=4)
    p.add_argument("--frame-width", type=float, default=220)
    p.add_argument("--x-range", type=float, nargs=2, default=(0, 175), metavar=("X0", "X1"),
                   help="only look at columns X0..X1 (pt)")
    p.add_argument("--threshold", type=int, default=60,
                   help="RGB distance that counts as ink; lower it to catch white cards")
    p.add_argument("--figma-top", type=float, default=39, help="skip the PhoneHeader mock (pt)")
    p.add_argument("--device-top", type=float, default=12, help="skip the status bar (pt)")
    p.add_argument("--offset", type=float, default=None,
                   help="expected figma-minus-device offset; found automatically if omitted")
    a = p.parse_args()

    bg = tuple(int(a.bg[i : i + 2], 16) for i in (0, 2, 4))
    device_ppt = Image.open(a.device).width / a.frame_width
    f = bands(a.figma, a.figma_scale, a.figma_top, bg, a.x_range, a.threshold)
    d = bands(a.device, device_ppt, a.device_top, bg, a.x_range, a.threshold)

    # Pair by position, not by index: one missing band (a chip that has no
    # data, an extra line on device) would shift every pair after it. Pick the
    # offset most bands agree on, then match each Figma band to the nearest
    # device band at that offset.
    if a.offset is not None:
        best = a.offset
    else:
        candidates = [ft - dt for ft, _ in f for dt, _ in d]
        best = max(candidates, key=lambda o: sum(any(abs(ft - dt - o) <= 1.5 for dt, _ in d) for ft, _ in f), default=0)

    offsets = []
    print(f"{'figma':>15} {'device':>15} {'offset':>7}")
    used = set()
    for ft, fb in f:
        near = min((i for i in range(len(d)) if i not in used), key=lambda i: abs(ft - d[i][0] - best), default=None)
        if near is None or abs(ft - d[near][0] - best) > 6:
            print(f"{ft:6.1f}-{fb:6.1f}  {'(no match)':>15}")
            continue
        used.add(near)
        dt, db = d[near]
        offsets.append((ft, ft - dt))
        print(f"{ft:6.1f}-{fb:6.1f}  {dt:6.1f}-{db:6.1f}  {ft - dt:7.1f}")
    extra = [d[i] for i in range(len(d)) if i not in used]
    if extra:
        print("device-only bands: " + ", ".join(f"{t:.1f}-{b:.1f}" for t, b in extra))
    if offsets:
        med = statistics.median(o for _, o in offsets)
        print(f"consensus (median) {med:.1f}")
        for ft, o in offsets:
            if abs(o - med) > 1:
                print(f"  outlier at figma y={ft:.1f}: {o - med:+.1f}pt from consensus")


if __name__ == "__main__":
    main()

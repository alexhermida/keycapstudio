import type { Manifold, ManifoldToplevel } from 'manifold-3d';
import { KEYCAP } from './config';

/**
 * Join the stem to the shell, clip it to the exterior, and cut the blind socket.
 * Borrows both inputs. The caller owns the returned solid; temporaries are freed here.
 */
export function attachStem(kernel: ManifoldToplevel, shell: Manifold, outside: Manifold): Manifold {
  const allocated: Manifold[] = [];
  const keep = (solid: Manifold): Manifold => {
    allocated.push(solid);
    return solid;
  };
  const { Manifold: M } = kernel;
  try {
    const stem = keep(
      keep(
        M.cylinder(12, KEYCAP.stemOuterDiameter / 2, KEYCAP.stemOuterDiameter / 2, 64),
      ).translate([0, 0, KEYCAP.stemBottom]),
    );
    // Preserve this order: the socket is cut after joining and clipping the body.
    const joined = keep(keep(shell.add(stem)).intersect(outside));
    const socketHeight = KEYCAP.stemBottom + KEYCAP.socketDepth + 1;
    const a = keep(
      keep(M.cube([KEYCAP.socketSpan, KEYCAP.socketArm, socketHeight], true)).translate([
        0,
        0,
        socketHeight / 2 - 1,
      ]),
    );
    const b = keep(
      keep(M.cube([KEYCAP.socketArm, KEYCAP.socketSpan, socketHeight], true)).translate([
        0,
        0,
        socketHeight / 2 - 1,
      ]),
    );
    return joined.subtract(keep(a.add(b)));
  } finally {
    for (let i = allocated.length - 1; i >= 0; i--) allocated[i].delete();
  }
}

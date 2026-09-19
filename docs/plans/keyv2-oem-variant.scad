// Development-only KeyV2 OEM variant recipe. Pass row, width_u, and exterior
// with OpenSCAD -D. Keep the row 5 / 1u reference recipes unchanged.
include <includes.scad>

$fn = 64;
$stem_inner_slop = 0.2;
$stem_throw = 4;
$cherry_bevel = true;
$support_type = "flared";

u(width_u) {
  oem_row(row, 0) {
    cherry(0.35) {
      unsupported_stem() {
        if (exterior) outer_shape();
        else key();
      }
    }
  }
}

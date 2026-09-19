// Solid exterior using the exact OEM profile and tessellation of the blank.
include <includes.scad>

$fn = 64;
$stem_inner_slop = 0.2;
$stem_throw = 4;
$cherry_bevel = true;
$support_type = "flared";

// Match the blank's Z-origin translation exactly.
translate([0, 0, -1.195]) {
  oem_row(5, 0) {
    cherry(0.35) {
      unsupported_stem() {
        outer_shape();
      }
    }
  }
}

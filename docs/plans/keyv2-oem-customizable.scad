// Generate bounded OEM row/width variants with the pinned KeyV2 checkout.
// radius_mm and height_delta_mm are supplied with OpenSCAD -D.
include <includes.scad>

$fn = 64;
$stem_inner_slop = 0.2;
$stem_throw = 4;
$cherry_bevel = true;
$support_type = "flared";

module customized_key() {
  oem_row(row, 0) {
    $corner_radius = radius_mm;
    $total_depth = $total_depth + height_delta_mm;
    cherry(0.35) {
      unsupported_stem() {
        if (exterior) outer_shape();
        else key();
      }
    }
  }
}

// The printed row 5 / 1u reference was authored without u(1). Keep its
// construction and origin; the other catalogue entries use the pinned recipe.
if (row == 5 && width_u == 1) {
  translate([0, 0, -1.195]) customized_key();
} else {
  u(width_u) customized_key();
}

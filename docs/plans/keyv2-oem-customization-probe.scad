// Development-only geometry probe. Supply the pinned KeyV2 checkout through
// OPENSCADPATH. Keep the validated row 5 / 1u assets unchanged.
include <includes.scad>

$fn = 64;
$stem_inner_slop = 0.2;
$stem_throw = 4;
$cherry_bevel = true;
$support_type = "flared";

translate([0, 0, -1.195]) {
  oem_row(5, 0) {
    // A nonzero height_delta_mm overrides the row's nominal depth: OEM-derived.
    $total_depth = $total_depth + height_delta_mm;
    $corner_radius = corner_radius_mm;
    cherry(0.35) {
      unsupported_stem() {
        if (exterior) outer_shape();
        else key();
      }
    }
  }
}

// KeyV2 OEM row 5 blank reference.
// Supply KeyV2's checkout with OpenSCAD's -I option.
include <keys.scad>

$fn = 64;
$stem_inner_slop = 0.2;
$stem_throw = 4;
$cherry_bevel = true;
$support_type = "disable";

oem_row(5, 0) {
  cherry(0.35) {
    unsupported_stem() {
      key();
    }
  }
}

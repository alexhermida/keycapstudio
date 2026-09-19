# KeyV2 OEM row 5 reference recipe

Status: pinned recipe prepared; STL generation is ready to run with a compatible OpenSCAD CLI.

## Pinned inputs

- KeyV2 repository: `https://github.com/rsheldiii/KeyV2.git`
- KeyV2 revision: `19f0d2faadd4949634c93f38d1a66869d29e8f43`
- KeyV2 license: GPL-3.0, retained in the development checkout under `_tmp/KeyV2/`
- OpenSCAD: record the exact `--version` output used for generation
- Units: millimeters; Z up; +Y rear; stem axis at X=Y=0; base Z=0

## Resolved configuration

The source revision's `oem_row(5, 0)` sets the OEM row 5 profile to:

| Parameter                   |             Value |
| --------------------------- | ----------------: |
| bottom key width and height |          18.05 mm |
| width difference            |            5.8 mm |
| height difference           |              4 mm |
| dish type and depth         | cylindrical, 1 mm |
| top skew                    |           1.75 mm |
| row 5 total depth           |           11.2 mm |
| row 5 top tilt              |        -3 degrees |
| stem inset                  |            1.2 mm |

The generation wrapper resolves the remaining fit and support settings explicitly:

```scad
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
```

This preserves KeyV2's structural Cherry stem and roof connection while omitting sacrificial interior and stem printing aids. It deliberately does not substitute the current application's socket dimensions or fit values.

## Generation command

With KeyV2 checked out at the pinned revision and OpenSCAD available, expose the KeyV2 checkout through `OPENSCADPATH`:

```sh
OPENSCADPATH=/path/to/KeyV2 \
  openscad \
  -o _tmp/oem-template-comparison/keyv2_oem_row5_reference.stl \
  docs/plans/keyv2-oem-row5.scad
```

Record the exact OpenSCAD version and the final STL SHA-256 in the comparison manifest. Inspect the STL as a closed positive-volume solid before using it in any surface comparison. The candidate must also have a separately derived solid exterior envelope from the same resolved configuration; a hollow STL alone is insufficient for the existing inlay-band operation.

No candidate dimensions, physical-fit claims, runtime template, or adoption decision follow from this recipe alone.

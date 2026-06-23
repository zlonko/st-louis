"""
Export census tract attributes to dataset.csv with precomputed chart layouts.
Requires input/census_tracts_stl.csv.
"""

import subprocess
import sys
from pathlib import Path

import pandas as pd

from paths import INPUT, OUTPUT

SCRIPT_DIR = Path(__file__).resolve().parent
COMPUTE_LAYOUTS = SCRIPT_DIR / "compute_layouts.mjs"


def main() -> None:
    census_path = INPUT / "census_tracts_stl.csv"
    output_path = OUTPUT / "dataset.csv"
    temp_path = OUTPUT / "dataset_pre_layout.csv"

    if not census_path.exists():
        raise FileNotFoundError(f"Missing {census_path}.")

    df_census = pd.read_csv(census_path)

    OUTPUT.mkdir(parents=True, exist_ok=True)
    df_census.to_csv(temp_path, index=False)

    result = subprocess.run(
        ["node", str(COMPUTE_LAYOUTS), str(temp_path), str(output_path)],
        capture_output=True,
        text=True,
    )
    if result.returncode != 0:
        print(result.stderr, file=sys.stderr)
        raise RuntimeError("compute_layouts.mjs failed")

    temp_path.unlink(missing_ok=True)
    print(result.stdout.strip())
    print(f"\nFinished export to {output_path}\n")


if __name__ == "__main__":
    main()

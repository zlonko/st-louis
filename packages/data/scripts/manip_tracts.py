"""
Merge census tract attributes with GeoJSON coordinates to produce dataset.csv.
Requires input/census_tracts_stl.csv and input/tracts.geojson.
"""

import pandas as pd
from paths import INPUT, OUTPUT


def load_geojson(filename_geojson):
    df = pd.read_json(filename_geojson, orient="records")
    df = pd.json_normalize(df["features"])
    return df


def main() -> None:
    geojson_path = INPUT / "tracts.geojson"
    census_path = INPUT / "census_tracts_stl.csv"
    output_path = OUTPUT / "dataset.csv"

    if not geojson_path.exists():
        raise FileNotFoundError(
            f"Missing {geojson_path}. Place St. Louis tract GeoJSON at input/tracts.geojson "
            "or copy a pre-built dataset.csv to output/."
        )

    df_tracts = load_geojson(geojson_path)
    df_tracts["GEOID"] = "1400000US" + df_tracts["properties.GEOID"].astype(str)
    df_tracts_coords = df_tracts[["GEOID", "geometry.coordinates"]].copy()
    df_tracts_coords = df_tracts_coords.rename(columns={"geometry.coordinates": "coords"})

    df_census = pd.read_csv(census_path)
    df = df_census.merge(df_tracts_coords, right_on="GEOID", left_on="ACS_GEO_ID", how="left")

    OUTPUT.mkdir(parents=True, exist_ok=True)
    df.to_csv(output_path, index=False)
    print(f"\nFinished export to {output_path}\n")


if __name__ == "__main__":
    main()

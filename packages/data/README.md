# St. Louis Data Pipeline

Python scripts for collecting and transforming U.S. Census data used by the [St. Louis, Divided](../web) scrollytelling app.

## Pipeline

```
census.py          → input/census_tracts.csv
stl_metro.py       → output/census_tracts_stl.csv
manip_tracts.py    → output/dataset.csv   (requires input/tracts.geojson)
populationchange.csv → copied manually to web app (historical population data)
```

## Setup

```bash
cd packages/data
pip install -r requirements.txt
```

## Regenerate tract data

```bash
# Optional: fetch raw ACS data from Census API (requires network)
python scripts/census.py

# Filter to St. Louis City and County
python scripts/stl_metro.py

# Merge with tract geometry (requires input/tracts.geojson)
python scripts/manip_tracts.py
```

## Sync CSVs to the web app

From the repository root:

```bash
npm run build:data
```

This runs `stl_metro.py` and `manip_tracts.py`, then copies `output/*.csv` and `input/populationchange.csv` to `packages/web/public/data/`.

## Notes

- `dataset.csv` is committed in the web package because `manip_tracts.py` requires a tract GeoJSON file (`input/tracts.geojson`) that is not included in this repository.
- `populationchange.csv` contains historical population figures (1880–2010) for St. Louis City and County.

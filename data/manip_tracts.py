import pandas as pd

def load_geojson(filename_geojson):
    """
    Import GeoJSON file and convert to dataframe. Any level can be used: state, county, tract, etc.
    """
    df = pd.read_json(filename_geojson, orient='records')
    df = pd.json_normalize(df["features"])
    return df

# features.properties.COUNTYFP == '189'

df_tracts = load_geojson('./c.json')
df_tracts['GEOID'] = '1400000US' + df_tracts['properties.GEOID'].astype(str) 
df_tracts_coords = df_tracts[['GEOID','geometry.coordinates']].copy()

df_census = pd.read_csv('./census_tracts_stl.csv')

df = df_census.merge(df_tracts_coords, right_on='GEOID', left_on='ACS_GEO_ID', how='left')
df.to_csv('./dataset.csv')

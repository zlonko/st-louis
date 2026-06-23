"""
Filter and transform census tract data for the St. Louis City and County area.
"""

import pandas as pd
from paths import INPUT, OUTPUT

stl_metro_counties = {
    "29510": "St. Louis City",
    "29189": "St. Louis County",
}


def load_csv(filename: Path) -> pd.DataFrame:
    return pd.read_csv(filename)


def filter_to(df: pd.DataFrame, level_list: dict) -> pd.DataFrame:
    df = df.copy()
    df["STATECOUNTY"] = df["STATE"].astype(str) + df["COUNTY"].astype(str)
    filter_list = list(level_list.keys())
    return df[df["STATECOUNTY"].isin(filter_list)].copy()


def manip(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    df["N_BLACK"] = df["ACS_N_RACE_BLACK"]
    df["PCT_BLACK"] = df["ACS_N_RACE_BLACK"] / df["ACS_N_RACE_TOTAL_POP"]
    df["N_NOT_WHITE"] = df["ACS_N_RACE_TOTAL_POP"] - df["ACS_N_RACE_WHITE"]
    df["PCT_NOT_WHITE"] = df["N_NOT_WHITE"] / df["ACS_N_RACE_TOTAL_POP"]
    df["N_UNINSURED"] = df["ACS_N_TOTAL_POP"] - df["ACS_N_INSURED_NON_INST"]
    df["PCT_UNINSURED"] = df["N_UNINSURED"] / df["ACS_N_TOTAL_POP"]
    df["N_POVERTY_STAT"] = df["ACS_N_POVERTY_STAT_BELOW_100_PCT"]
    df["PCT_POVERTY_STAT"] = df["N_POVERTY_STAT"] / df["ACS_N_POVERTY_STAT"]
    df["N_DISABIL_STAT"] = df["ACS_N_DISABIL_Y"]
    df["PCT_DISABIL_STAT"] = df["ACS_N_DISABIL_Y"] / (df["ACS_N_DISABIL_Y"] + df["ACS_N_DISABIL_N"])
    df["COUNTY_NAME"] = df["STATECOUNTY"].map(stl_metro_counties)

    buckets = [4000, 11000, 18000, 25000, 32000, 39000, 46000, 53000, 60000, 67000, 74000, 81000, 88000]
    df["bucket"] = pd.cut(df["ACS_MED_INCOME"], bins=buckets)
    df["bucket_idx"] = pd.cut(df["ACS_MED_INCOME"], bins=buckets, labels=False) + 1
    df["midpoint"] = df["bucket"].apply(lambda x: x.mid)

    return df


def main() -> None:
    filename_import = INPUT / "census_tracts.csv"
    filename_export = OUTPUT / "census_tracts_stl.csv"

    df = load_csv(filename_import)
    df_stl = filter_to(df, stl_metro_counties)
    df_stl_manip = manip(df_stl)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    df_stl_manip.to_csv(filename_export, index=False)
    print(f"\nFinished export to {filename_export}\n")


if __name__ == "__main__":
    main()

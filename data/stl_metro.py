"""
name: stl_metro.py
Purpose: Clean data for the St. Louis Metropolitan statistical area --
Bond County (17|5), Calhoun County (17|3), Clinton County (17|27), Jersey County (17|83), Macoupin County (17|117),
Madison County (17|119), Monroe County (17|133), St. Clair County (17|163), Franklin County (29|71), Jefferson County (29|99),
Lincoln County (29|113), St. Charles County (29|183), St. Louis City (29|510), St. Louis County (29|189), Warren County (29|219)
"""

import pandas as pd 
import numpy as np


def load_csv(filename):

    df = pd.read_csv(filename)

    return df


def filter_to(df, level_list):

    # create concatenated filter column from state and county
    df['STATECOUNTY'] = df['STATE'].astype(str) + df['COUNTY'].astype(str)
    filter_list = list(level_list.keys())
    df_stl = df[df['STATECOUNTY'].isin(filter_list)].copy()

    return df_stl

def manip(df):

    # create pop non-white column, which = (total pop surveyed for race - total pop identifying white)
    df['N_BLACK'] = df['ACS_N_RACE_BLACK']

    # create % non-white column, which = ((total pop surveyed for race - total pop identifying white) / total pop surveyed for race)
    df['PCT_BLACK'] = df['ACS_N_RACE_BLACK'] / df['ACS_N_RACE_TOTAL_POP']

    # create pop non-white column, which = (total pop surveyed for race - total pop identifying white)
    df['N_NOT_WHITE'] = (df['ACS_N_RACE_TOTAL_POP']-df['ACS_N_RACE_WHITE'])

    # create % non-white column, which = ((total pop surveyed for race - total pop identifying white) / total pop surveyed for race)
    df['PCT_NOT_WHITE'] = (df['ACS_N_RACE_TOTAL_POP']-df['ACS_N_RACE_WHITE']) / df['ACS_N_RACE_TOTAL_POP']

    # create pop uninsured column, which = (total population - total insured)
    df['N_UNINSURED'] = (df['ACS_N_TOTAL_POP'] - df['ACS_N_INSURED_NON_INST'])

    # create % uninsured column, which = ((total population - total insured) / total population)
    df['PCT_UNINSURED'] = (df['ACS_N_TOTAL_POP'] - df['ACS_N_INSURED_NON_INST']) / df['ACS_N_TOTAL_POP']

    # create % poverty status column, which = (total pop below 100% poverty line)
    df['N_POVERTY_STAT'] = df['ACS_N_POVERTY_STAT_BELOW_100_PCT']

    # create % poverty status column, which = (total pop below 100% poverty line / total pop surveyed for poverty status)
    df['PCT_POVERTY_STAT'] = df['ACS_N_POVERTY_STAT_BELOW_100_PCT'] / df['ACS_N_POVERTY_STAT']

    # create % disability status column, which = (total pop responding yes to disability status)
    df['N_DISABIL_STAT'] = df['ACS_N_DISABIL_Y']

    # create % disability status column, which = (total pop responding yes to disability status / (total pop responding yes and no))
    df['PCT_DISABIL_STAT'] = df['ACS_N_DISABIL_Y'] / (df['ACS_N_DISABIL_Y'] + df['ACS_N_DISABIL_N'])

    # give county names to each tract
    df['COUNTY_NAME'] = df['STATECOUNTY'].map(stl_metro_counties)

    # assign histogram bin columns
    buckets = [4000,11000,18000,25000,32000,39000,46000,53000,60000,67000,74000,81000,88000]
    df['bucket'] = pd.cut(df['ACS_MED_INCOME'], bins=buckets)
    df['bucket_idx'] = pd.cut(df['ACS_MED_INCOME'], bins=buckets, labels=False)
    df['bucket_idx'] = df['bucket_idx'] + 1

    # assign midpoint of bin
    df['midpoint'] = df['bucket'].apply(lambda x: x.mid)

    return df


if __name__ == '__main__':

    filename_import = './census_tracts.csv'
    filename_export = './census_tracts_stl.csv'

    filename_import_co = './census_counties.csv'
    filename_export_co = './census_counties_stl.csv'

    stl_metro_counties = {
        # '175':'Bond',
        # '173':'Calhoun',
        # '1727':'Clinton',
        # '1783':'Jersey',
        # '17117':'Macoupin',
        # '17119':'Madison',
        # '17133':'Monroe',
        # '17163':'St. Clair',
        # '2971':'Franklin',
        # '2999':'Jefferson',
        # '29113':'Lincoln',
        # '29183':'St. Charles',
        '29510':'St. Louis City',
        '29189':'St. Louis County'
        # '29219':'Warren'
    }

    df = load_csv(filename_import)
    df_stl = filter_to(df, stl_metro_counties)
    df_stl_manip = manip(df_stl)
    df_stl_manip.to_csv(filename_export)
    print('\nFinished export to' + filename_export +'\n')

    df = load_csv(filename_import_co)
    df_stl = filter_to(df, stl_metro_counties)
    df_stl_manip = manip(df_stl)
    df_stl_manip.to_csv(filename_export_co)
    print('\nFinished export to' + filename_export_co +'\n')
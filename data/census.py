"""
Name: census.py
Purpose: Extract raw census data from American Community Survey, 5-year, 2018 
Reference: https://api.census.gov/data/2018/acs/acs5/subject/variables.html
--------------------------------------------------------
"""

# REQUIREMENTS------------------------------------------
import pandas as pd
import requests
import json
from datetime import datetime as dt
import time
import glob
import os

start_time = time.time()
py_name = 'census'
file_path = './'

def acs_query():

    address = 'https://api.census.gov/data/2018/acs/acs5/subject'

    column_dict = {
        'NAME':'NAME'
        ,'TRACT': 'TRACT'
        ,'STATE': 'STATE'
        ,'COUNTY': 'COUNTY'
        # geography
        ,'GEO_ID': 'ACS_GEO_ID'
        # total population
        ,'S0101_C01_001E':'ACS_N_TOTAL_POP'
        # population by sex
        ,'S0101_C03_001E':'ACS_N_MALE'
        ,'S0101_C05_001E':'ACS_N_FEMALE'
        # population by age
        ,'S0101_C01_032E':'ACS_MED_AGE' # median age
        ,'S0101_C03_032E':'ACS_MED_AGE_M' # median age males
        ,'S0101_C05_032E':'ACS_MED_AGE_F' # median age female
        # population by race
        ,'S0701_C01_014E':'ACS_N_RACE_TOTAL_POP' # count pop for all race data
        ,'S0701_C01_015E':'ACS_N_RACE_WHITE' # count pop single race: white
        ,'S0701_C01_016E':'ACS_N_RACE_BLACK' # count pop single race: black
        ,'S0701_C01_017E':'ACS_N_RACE_AMERIND' # count pop single race: american indian, alaska native
        ,'S0701_C01_018E':'ACS_N_RACE_ASIAN' # count pop single race: asian
        ,'S0701_C01_019E':'ACS_N_RACE_HAWPACISL' # count pop single race: hawaiian, pacific islander
        ,'S0701_C01_020E':'ACS_N_RACE_OTHER' # count pop single race: other race
        ,'S0701_C01_021E':'ACS_N_RACE_TWOORMORE' # count pop two or more races
        # population by ethnicity
        ,'S0701_C01_022E':'ACS_N_ETHN_HISPLAT_Y' # count pop identify as hispanic/latino
        ,'S0701_C01_023E':'ACS_N_ETHN_HISPLAT_N' # count pop do not identify as hispanic/latino
        # population income
        ,'S0601_C01_047E':'ACS_MED_INCOME'
        ,'S0701_C01_048E':'ACS_MED_INCOME_PAST_12MO' # median income in past 12 months
        ,'S0701_C01_049E':'ACS_N_POVERTY_STAT' # count pop qualify at poverty level
        ,'S0701_C01_050E':'ACS_N_POVERTY_STAT_BELOW_100_PCT' # count pop below 100% of poverty level
        ,'S0701_C01_051E':'ACS_N_POVERTY_STAT_100_TO_149_PCT' # count pop at 100%-149% of poverty level
        ,'S0701_C01_052E':'ACS_N_POVERTY_STAT_ABOVE_150_PCT' # count pop above 150% of poverty level
        # insurance status
        ,'S2701_C02_001E':'ACS_N_INSURED_NON_INST' # count pop w insurance, not institutionalized
        ,'S2701_C02_011E':'ACS_N_INSURED_NON_INST_UNDER_19' # count pop w insurance under 19 years old, not institutionalized
        ,'S2701_C02_012E':'ACS_N_INSURED_NON_INST_19_TO_64' # count pop w insurance ages 19-64, not institutionalized
        ,'S2701_C02_013E':'ACS_N_INSURED_NON_INST_OVER_65' # count pop w insurance over 65 years old, not institutionalized
        # disability status
        ,'S2701_C02_035E':'ACS_N_DISABIL_Y' # count pop w disability status
        ,'S2701_C02_036E':'ACS_N_DISABIL_N' # count pop without disability status
    }

    geographies = 'tract:*'
    state = 'state:'

    print(py_name + ': Contacting census.gov API...')

    response = requests.get(
        address
        +'?get=' + ','.join(column_dict.keys())
        +'&for=' + geographies
        +'&in=' + state + str(scope)
    )

    print(py_name + ': API Address = ' + address
        +'?get=' + ','.join(column_dict.keys())
        +'&for=' + geographies
        +'&in=' + state + str(scope)
    )

    print(py_name + ': API Response = ' + str(response.status_code))
    
    return response, column_dict


def acs_clean(response, column_dict):

    print(py_name + ': Converting JSON...')
    # create surveyData from response
    survey_data = response.text
    # read in json to dataframe
    df = pd.read_json(survey_data, orient='columns')

    print(py_name + ': Cleaning data...')
    # move row[0] to columns and drop
    df.columns = df.iloc[0]
    df = df.drop([0])
    # add year column to track the year of the data
    df.insert(0, "Year", 2018, True)
    # map the column names to descriptions using our column_dict object
    df = df.rename(columns=column_dict)
    # null values are noted '-666666666', replace them with NaN
    df = df.astype(str)
    df = df.replace('-666666666','NaN')
    df = df.replace('-666666666.0','NaN')
    df = df.replace('','NaN')
    df = df.replace(' ','NaN')
    # standardize digits of geography identifiers
    df['TRACT'] = df['TRACT'].apply(lambda x: x.zfill(6))
    df['COUNTY'] = df['COUNTY'].apply(lambda x: x.zfill(3))
    df['STATE'] = df['STATE'].apply(lambda x: x.zfill(2))
    df = df.drop(columns=['state','county','tract'])
    
    return df


def acs_export(df):

    # export csv files to /data directory
    print(py_name + ': Exporting CSV to ' + file_path +'...')
    date = dt.today().strftime('%Y_%m_%d')
    df.to_csv(file_path + py_name + '_state_' + scope + '.csv', header=True, index = None)
    script_duration = str(round((time.time() - start_time),2))
    print(py_name + ': [---{} sec---] Census export complete'.format(script_duration))
    print('FILE: ' + file_path + py_name + '_state_' + scope + '.csv')


def acs_append_tracts():
    """Appending the state-level tract data"""

    print(py_name + ': Concatenating CSV for ALL CENSUS TRACTS to ' + file_path +'...')
    all_files = glob.glob(file_path + '/*_state_*.csv')
    li = []
    for filename in all_files:
        df = pd.read_csv(filename, index_col=None, header=0)
        li.append(df)
    df_tracts = pd.concat(li, axis=0, ignore_index=True)
    df_tracts.to_csv(file_path + py_name + '_tracts.csv')
    print('TRACT-LEVEL FILE: ' + file_path + py_name + '_tracts.csv')
    print('------------------------------------------------')

    return df_tracts
    

def acs_group_counties(df, group_name):
    """Grouping tract-level data at county level"""

    print(py_name + ': Rolling up data to CSV for CENSUS COUNTIES to ' + file_path +'...')
    date = dt.today().strftime('%Y_%m_%d')

    print(py_name + ': Running roll-up process for counties...')
    # certain columns need to be rolled up using an average vs. sums
    # split df into 1) df for averages, 2) df for sums, then 3) rejoin them
    # first concat STATE and COUNTY into unique identifier
    df['STATECOUNTY'] = df['STATE'].astype(str) + '_' + df['COUNTY'].astype(str)
    df.columns = df.columns.str.strip()
    columns_to_average = ['STATECOUNTY','STATE','COUNTY','ACS_MED_AGE','ACS_MED_AGE_M','ACS_MED_AGE_F','ACS_MED_INCOME_PAST_12MO','ACS_MED_INCOME']
    # create df for rolling up by means
    df_groups_means = df.filter(items=columns_to_average)
    df_groups_means = df_groups_means.groupby('STATECOUNTY', as_index=False).mean()
    # create df for rolling up by sums
    df_groups_sums = df.drop(columns=columns_to_average[1:])
    df_groups_sums = df_groups_sums.groupby('STATECOUNTY', as_index=False).sum()
    # merge dfs on STATECOUNTY number
    df_groups = df_groups_sums.merge(df_groups_means, left_on='STATECOUNTY', right_on='STATECOUNTY', how='left')
    # drop tract column
    df_groups = df_groups.drop(columns=['Year','TRACT'], axis=1)
    df_groups.insert(0, "Year", 2018, True)

    print(py_name + ': Printing CSV file...')
    # export to csv
    df_groups.to_csv(file_path + py_name + group_name + '.csv')
    script_duration = str(round((time.time() - start_time), 2))
    print('COUNTY-LEVEL FILE: ' + file_path + py_name + group_name + '.csv')

    print('------------------------------------------------')


def acs_files_cleanup():
    # remove state-level files
    all_files = glob.glob(file_path + '/*_state_*.csv')
    li = []
    for filename in all_files:
        os.remove(filename)
    print('CLEANUP: Individual state-level files removed')
    print('------------------------------------------------')


if __name__ == '__main__':
    global scopes
    scopes = [17,29]
    for scope in scopes:   
        scope = str(scope).zfill(2) 
        response, column_dict = acs_query()
        if str(response.status_code) == '200':
            df = acs_clean(response, column_dict)
            acs_export(df)
        else: 
            print('NO SCOPE AT STATE #: {error_scope}!'.format(error_scope=scope)) # these do not have a corresponding state: 03, 07, 14, 43
    df_tracts = acs_append_tracts()
    acs_group_counties(df_tracts, '_counties')
    acs_files_cleanup()

#!/usr/bin/env python
# coding: utf-8

# give jobs indicator: SE(Software engineer) or DS(data scientist)
# merge 2 files
# sort jobs based on company

import pandas as pd

DSdf = pd.read_csv("Myunghee_datascientistGlassdoor958.csv")
SEdf = pd.read_csv("Myunghee_softwareGlassdoor958.csv")

# give jobs indicator: SE(Software engineer) or DS(data scientist)
DSlist = ["DS" for i in range(len(DSdf))]
SElist = ["SE" for i in range(len(SEdf))]

DSdf['SE/DS'] = DSlist
SEdf['SE/DS'] = SElist

# merge 2 files
frames = [DSdf, SEdf]

result = pd.concat(frames)

result.sort_values(by= 'Company Name', axis=0, ascending=True, inplace=True, kind='quicksort', na_position='last')
result.reset_index(drop=True, inplace=True)
# remove the last record which doesn't have enough information
result.drop([len(result)-1], axis=0, inplace=True)

# clean company name by removing \n, \r, and converting lowercase
companyName = list()
for name in result['Company Name']:
    try:
        companyName.append(name.split("\n")[0].strip('\r').lower())
    except:
        companyName.append(name.lower())
result['Company Name'] = companyName

# sorting by company name
result.sort_values(by= 'Job Description', axis=0, ascending=True, inplace=True, kind='quicksort', na_position='last')
result.sort_values(by= 'Job Title', axis=0, ascending=True, inplace=True, kind='quicksort', na_position='last')
result.sort_values(by= 'Company Name', axis=0, ascending=True, inplace=True, kind='quicksort', na_position='last')
result.reset_index(drop=True, inplace=True)

# remove duplicates

N = len(result)
duplicate = list()
for i in range(N):
    for j in range(i+1, N):
        if result.iloc[i]['Company Name'] == result.iloc[j]['Company Name']:
            if result.iloc[i]['Job Title'] == result.iloc[j]['Job Title']:
                if result.iloc[i]['Job Description'] == result.iloc[j]['Job Description']:
                    if result.iloc[i]['SE/DS'] == result.iloc[j]['SE/DS']:
                        duplicate.append(j)
                    
        else:
            break

result.drop(duplicate, axis=0, inplace=True)
result.reset_index(drop=True, inplace=True)

f = open("companyNameGlassdoor.txt", mode = "w+")
for com in sorted(set(result['Company Name'])):
    f.write(com)
    f.write("\n")
f.close()

result.to_csv(r'glassdoorData.csv', index = False, header=True)

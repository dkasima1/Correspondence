import pandas as pd
import glob

#-----------Concatenate all text files into one large CSV-----------#

read_files = glob.glob("data/*.txt")
dfArray = []
ID = 1
for file in read_files:
    df = pd.read_json(file, orient='columns')
    df['ID'] = ID
    dfArray.append(df)
    ID += 1 
frame = pd.concat(dfArray, axis=0, ignore_index=True)
export_csv = frame.to_csv(r'export_dataframe_exp.csv', index = None, header=True)

#-----------Access an individual parameter-----------#
# read_files = glob.glob("data/*.txt")
# dfArray = []
# for file in read_files:
#     df = pd.read_json(file, orient='columns')
#     dfArray.append(df)
# for files in dfArray:
#     print(files['reaction_time'])
import pandas as pd
import json, os, calendar
from sklearn.linear_model import LinearRegression
import numpy as np

print("Current working directory:", os.getcwd())

file_name = "netflix_titles.csv"
if not os.path.isfile(file_name):
    print(f"ERROR: File '{file_name}' not found in: {os.getcwd()}")
    exit()

try:
    df = pd.read_csv(file_name)
    df.dropna(subset=['type', 'release_year'], inplace=True)
    df['date_added']  = pd.to_datetime(df['date_added'], errors='coerce')
    df['year_added']  = df['date_added'].dt.year
    df['month_added'] = df['date_added'].dt.month_name()

    output = {
        "type_counts":   df['type'].value_counts().to_dict(),
        "yearly_counts": df['year_added'].value_counts().sort_index().to_dict(),
        "ratings":       df['rating'].value_counts().head(10).to_dict(),
        "top_genres":    df['listed_in'].str.split(', ').explode().value_counts().head(10).to_dict(),
        "top_countries": df['country'].value_counts().head(10).to_dict()
    }

    
    output["yearly_counts_all"] = output["yearly_counts"]
    output["yearly_by_type"] = {
        t: df[df['type']==t]['year_added'].value_counts().sort_index().to_dict()
        for t in df['type'].unique()
    }

    
    output["month_counts"] = (
        df['month_added'].value_counts()
          .reindex(calendar.month_name[1:], fill_value=0)
          .astype(int).to_dict()
    )
    output["month_by_type"] = {
        t: (df[df["type"]==t]['month_added']
               .value_counts()
               .reindex(calendar.month_name[1:], fill_value=0)
               .astype(int).to_dict())
        for t in df["type"].unique()
    }

    
    movies = df[df['type']=='Movie'].copy()
    movies['minutes'] = movies['duration'].str.extract('(\d+)').astype(float)
    bins   = [0, 60, 90, 120, 1e6]
    labels = ['<60','60‑90','90‑120','120+']
    output["runtime_bins"] = (
        pd.cut(movies['minutes'], bins=bins, labels=labels, right=False)
          .value_counts().reindex(labels).fillna(0).astype(int).to_dict()
    )

    
    output["top_directors"] = (
        df['director'].dropna().str.split(', ').explode()
          .value_counts().head(10).to_dict()
    )

    
    years  = np.array(list(output["yearly_counts_all"].keys()), dtype=float).reshape(-1,1)
    counts = np.array(list(output["yearly_counts_all"].values()), dtype=float)
    reg    = LinearRegression().fit(years, counts)
    output["reg_coef"]      = float(reg.coef_[0])      
    output["reg_intercept"] = float(reg.intercept_)    

    
    os.makedirs("data", exist_ok=True)
    with open("data/processed_data.json","w") as f:
        json.dump(output, f, indent=2)

    print("Success! Data saved to data/processed_data.json")

except Exception as e:
    print("An unexpected error occurred:", e)

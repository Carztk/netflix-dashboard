import pandas as pd
import json
import os

print("Current working directory:", os.getcwd())

file_name = "netflix_titles.csv"

if not os.path.isfile(file_name):
    print(f"ERROR: File '{file_name}' not found in: {os.getcwd()}")
    exit()

try:
    df = pd.read_csv(file_name)
    df.dropna(subset=['type', 'release_year'], inplace=True)
    df['date_added'] = pd.to_datetime(df['date_added'], errors='coerce')
    df['year_added'] = df['date_added'].dt.year

    output = {
        "type_counts": df['type'].value_counts().to_dict(),
        "yearly_counts": df['year_added'].value_counts().sort_index().to_dict(),
        "ratings": df['rating'].value_counts().head(10).to_dict(),
        "top_genres": df['listed_in'].str.split(', ').explode().value_counts().head(10).to_dict(),
        "top_countries": df['country'].value_counts().head(10).to_dict()
    }

    yearly_all = df['year_added'].value_counts().sort_index().to_dict()
    yearly_by_type = {}
    for t in df['type'].unique():
        filtered = df[df['type'] == t]
        yearly_by_type[t] = filtered['year_added'].value_counts().sort_index().to_dict()

    output["yearly_counts_all"] = yearly_all
    output["yearly_by_type"] = yearly_by_type

    os.makedirs("data", exist_ok=True)
    with open("data/processed_data.json", "w") as f:
        json.dump(output, f, indent=4)

    print("Success! Data saved to 'data/processed_data.json'")

except Exception as e:
    print("An unexpected error occurred:", str(e))

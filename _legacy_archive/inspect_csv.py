import pandas as pd
import json

file_path = r"C:\Users\Dakshh Goel\.cache\kagglehub\datasets\jainamgada45\indian-government-schemes\versions\1\updated_data.csv"

df = pd.read_csv(file_path, nrows=50)

# We want to extract a few relevant schemes for our profiles (Farmer, BPL, etc)
# Let's just dump the first 5 rows to JSON to see the structure
sample_data = df.head().to_dict('records')

with open('sample_schemes.json', 'w', encoding='utf-8') as f:
    json.dump(sample_data, f, ensure_ascii=False, indent=2)

print("Saved sample to sample_schemes.json")
 
 

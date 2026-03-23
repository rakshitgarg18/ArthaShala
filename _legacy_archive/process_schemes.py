import pandas as pd
import json
import re

file_path = r"C:\Users\Dakshh Goel\.cache\kagglehub\datasets\jainamgada45\indian-government-schemes\versions\1\updated_data.csv"

# Read the full dataset
df = pd.read_csv(file_path)

# Drop rows without eligibility or benefits
df = df.dropna(subset=['eligibility', 'benefits', 'scheme_name'])

def extract_amount(text):
    match = re.search(r'₹\s*([\d,]+)', str(text))
    if match:
        val_str = match.group(1).replace(',', '')
        try:
            return int(val_str)
        except:
            return 5000
    return 5000

def create_scheme_obj(row, profile_req):
    desc = str(row['details'])[:100] + '...' if pd.notnull(row['details']) else 'Government Benefit'
    return {
        "id": str(row['slug']),
        "name": str(row['scheme_name']),
        "nameHi": str(row['scheme_name']),  # No translation API, use English for MVP
        "description": desc,
        "descriptionHi": desc,
        "benefitAmount": extract_amount(row['benefits']),
        "triggerConditions": {
            "maxWallet": 999999,
            "activeMonths": [1,2,3,4,5,6,7,8,9,10,11,12],
            "requiredEvent": None,
            "requiredProfile": profile_req
        },
        "actionChecklist": [
            { "en": "Aadhaar Card", "hi": "आधार कार्ड", "icon": "🆔" },
            { "en": "Bank Details", "hi": "बैंक विवरण", "icon": "🏦" }
        ],
        "destination": {
            "en": "Visit Official Portal or CSC",
            "hi": "आधिकारिक पोर्टल या सीएससी पर जाएं"
        }
    }

final_schemes = []

# Existing base setups
# We will append the scraped ones to our existing list so we don't destroy the hardcoded MVP ones

# 1. Farmers (Land < 2 Hectares)
farmers = df[df['eligibility'].str.contains('farmer|agriculture|kisan', case=False, na=False)].head(3)
for _, row in farmers.iterrows():
    final_schemes.append(create_scheme_obj(row, {"land": "< 2 Hectares"}))

# 2. Laborers (Income: BPL)
laborers = df[df['eligibility'].str.contains('labor|worker|construction|bpl', case=False, na=False)].head(3)
for _, row in laborers.iterrows():
    final_schemes.append(create_scheme_obj(row, {"income": "BPL/Antyodaya"}))

# 3. Shopkeeper / MSME
shopkeepers = df[df['eligibility'].str.contains('msme|business|entrepreneur|shop', case=False, na=False)].head(3)
for _, row in shopkeepers.iterrows():
    final_schemes.append(create_scheme_obj(row, {"profession": "Shopkeeper"}))

# 4. General / Everyone
general = df[df['schemeCategory'].str.contains('Health|Education', case=False, na=False)].head(3)
for _, row in general.iterrows():
    final_schemes.append(create_scheme_obj(row, None))

# Load existing schemes
with open('src/data/schemes.json', 'r', encoding='utf-8') as f:
    existing = json.load(f)

# Append new ones
# Filter out duplicates by slug
existing_ids = set([s['id'] for s in existing])
for s in final_schemes:
    if s['id'] not in existing_ids:
        existing.append(s)

with open('src/data/schemes.json', 'w', encoding='utf-8') as f:
    json.dump(existing, f, ensure_ascii=False, indent=2)

print(f"Successfully appended {len(final_schemes)} dynamic schemes from dataset to schemes.json")
 
 

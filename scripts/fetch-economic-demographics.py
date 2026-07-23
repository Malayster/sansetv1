#!/usr/bin/env python3
"""
Fetch economic data + demographics from Tindak Malaysia General-Election-Data.

Downloads:
  - KEY ECONOMIC DATA BY PARLIAMENTARY SEAT (2019 & 2022) — medianIncome, GINI, poverty
  - KEY ECONOMIC DATA BY SABAH DUN SEATS (2024)
  - 2024/2025 ELECTORAL DEMOGRAPHICS — age/gender breakdown per DUN & PAR

Merges into data/kv-output/economic-demographics.json

Usage:
    python3 scripts/fetch-economic-demographics.py
"""

import csv, json, os, sys, io
from pathlib import Path
from urllib.request import urlopen
from urllib.parse import quote

BASE = Path(__file__).resolve().parent.parent
KV_OUTPUT = BASE / 'data' / 'kv-output'

REPO = "TindakMalaysia/General-Election-Data"
GITHUB = f"https://raw.githubusercontent.com/{REPO}/master"


def fetch_csv(path):
    url = GITHUB + '/' + '/'.join(quote(p) for p in path.split('/'))
    print(f"  Fetching {path.split('/')[-1]}...", end=' ')
    try:
        with urlopen(url, timeout=20) as resp:
            content = resp.read().decode('utf-8-sig')
            rows = list(csv.DictReader(io.StringIO(content)))
            print(f"{len(rows)} rows")
            return rows
    except Exception as e:
        print(f"Error: {e}")
        return None


def parse_int(val):
    try:
        return int(float(str(val).replace(',', ''))) if val and str(val).strip() else 0
    except:
        return 0


def parse_float(val):
    try:
        return round(float(str(val).replace(',', '')), 2) if val and str(val).strip() else 0.0
    except:
        return 0.0


def clean_code(code):
    """Normalise: 'P. 001' → 'P001', 'N. 01' → 'N01'"""
    c = code.strip().replace('.', '').replace(' ', '')
    if c.startswith('N') and len(c) < 3:
        return f"N{int(c[1:]):02d}"
    if c.startswith('P') and len(c) < 4:
        return f"P{int(c[1:]):03d}"
    return c


def process_economic_data():
    """Fetch and merge economic data for all PAR + DUN."""
    result = {}
    
    # ── PAR Economic 2022 ──
    rows = fetch_csv('ECONOMIC_DATA_BY_CONSTITUENCY/KEY ECONOMIC DATA BY PARLIAMENTARY SEAT (2022).csv')
    if rows:
        for r in rows:
            code = clean_code(r.get('PARLIAMENTARY CONSTITUENCY CODE', ''))
            if not code:
                continue
            entry = result.setdefault(code, {'code': code, 'state': r.get('STATE', '').title(), 'parlimen': True})
            entry.update({
                'state': r.get('STATE', '').title(),
                'parName': r.get('PARLIAMENTARY CONSTITUENCY NAME', '').strip(),
                'medianIncome2022': parse_int(r.get('MEDIAN MONTHLY HOUSEHOLD GROSS INCOME (2022)', 0)),
                'meanIncome2022': parse_int(r.get('MEAN MONTHLY HOUSEHOLD GROSS INCOME (2022)', 0)),
                'gini2022': parse_float(r.get('GINI COEFFICIENT (2022)', 0)),
                'povertyRate2022': parse_float(r.get('ABSOLUTE POVERTY INCIDENCE (%) (2022)', 0)),
                'ethnicClass2022': r.get('ETHNIC CLASSIFICATION (2022)', '').strip(),
                'totalElectors2022': parse_int(r.get('TOTAL ELECTORATE (GE15)', 0)),
            })
    
    # ── PAR Economic 2019 ──
    rows = fetch_csv('ECONOMIC_DATA_BY_CONSTITUENCY/KEY ECONOMIC DATA BY PARLIAMENTARY SEAT (2019).csv')
    if rows:
        for r in rows:
            code = clean_code(r.get('PARLIAMENTARY CONSTITUENCY CODE', ''))
            if not code:
                continue
            entry = result.setdefault(code, {'code': code, 'state': r.get('STATE', '').title(), 'parlimen': True})
            entry.update({
                'medianIncome2019': parse_int(r.get('MEDIAN MONTHLY HOUSEHOLD GROSS INCOME (2019)', 0)),
                'meanIncome2019': parse_int(r.get('MEAN MONTHLY HOUSEHOLD GROSS INCOME (2019)', 0)),
                'gini2019': parse_float(r.get('GINI COEFFICIENT (2019)', 0)),
                'povertyRate2019': parse_float(r.get('ABSOLUTE POVERTY INCIDENCE (%) (2019)', 0)),
            })
    
    # ── Sabah DUN Economic 2024 ──
    rows = fetch_csv('ECONOMIC_DATA_BY_CONSTITUENCY/KEY ECONOMIC DATA BY SABAH DUN SEATS (2024).csv')
    if rows:
        for r in rows:
            code = clean_code(r.get('STATE CONSTITUENCY CODE', ''))
            if not code:
                continue
            state = r.get('STATE', '').title()
            entry = result.setdefault(f'SBH_{code}', {
                'code': f'SBH_{code}',
                'state': state,
                'dun': True,
                'dunCode': code,
                'dunName': r.get('STATE CONSTITUENCY NAME', '').strip(),
            })
            entry['dun'] = True
            entry['parName'] = r.get('PARLIAMENTARY NAME', '').strip()
            entry['medianIncome2024'] = parse_int(r.get('MEDIAN HOUSEHOLD INCOME (RM) (2024)', 0))
            entry['povertyRate2024'] = parse_float(r.get('ABSOLUTE POVERTY (%) (2024)', 0))
            entry['ruralUrban'] = r.get('URBAN-RURAL CLASSIFICATION (2025)', '').strip()
            entry['ethnicMajority'] = r.get('ETHNIC MAJORITY (2025)', '').strip()
            entry['totalElectors2025'] = parse_int(r.get('TOTAL ELECTORS (2025)', 0))
    
    return result


def fetch_all_demographics():
    """Fetch demographics from ALL available files — PAR + DUN."""
    result = {}
    
    # ── Demographics: PAR 2025 (latest — all 222) ──
    rows = fetch_csv('2025 ELECTORAL DEMOGRAPHICS/MALAYSIA_AUGUST_2025_PARLIAMENT_COMPOSITION.csv')
    if rows:
        for r in rows:
            code = clean_code(r.get('PARLIAMENTARY CONSTITUENCY CODE', ''))
            if not code:
                continue
            entry = result.setdefault(code, {'code': code})
            entry.update({
                'parName': r.get('PARLIAMENTARY CONSTITUENCY NAME', '').strip(),
                'state': r.get('STATE', '').title(),
                'totalElectors2025': parse_int(r.get('TOTAL ELECTORS (AUGUST 2025)', 0)),
                'electorsOrdinary': parse_int(r.get('ELECTORS - ORDINARY VOTERS', 0)),
                'electorsMilitary': parse_int(r.get('ELECTORS - MILITARY', 0)),
                'electorsPolice': parse_int(r.get('ELECTORS - POLICE', 0)),
                'maleElectors': parse_int(r.get('MALE ELECTORS', 0)),
                'femaleElectors': parse_int(r.get('FEMALE ELECTORS', 0)),
                'age18to20': parse_int(r.get('18 - 20', 0) or r.get('18-20', 0)),
                'age21to29': parse_int(r.get('21 - 29', 0) or r.get('21-29', 0)),
                'age30to39': parse_int(r.get('30 - 39', 0) or r.get('30-39', 0)),
                'age40to49': parse_int(r.get('40 - 49', 0) or r.get('40-49', 0)),
                'age50to59': parse_int(r.get('50 - 59', 0) or r.get('50-59', 0)),
                'age60to69': parse_int(r.get('60 - 69', 0) or r.get('60-69', 0)),
                'age70to79': parse_int(r.get('70 - 79', 0) or r.get('70-79', 0)),
                'age80to89': parse_int(r.get('80 - 89', 0) or r.get('80-89', 0)),
                'age90plus': parse_int(r.get('90 AND ABOVE', 0)),
            })
    
    # ── Demographics: PAR 2024 ──
    rows = fetch_csv('2024 ELECTORAL DEMOGRAPHICS/MALAYSIA_APRIL_2024_PARLIAMENT_COMPOSITION.csv')
    if rows:
        for r in rows:
            code = clean_code(r.get('PARLIAMENTARY CONSTITUENCY CODE', ''))
            if not code:
                continue
            entry = result.setdefault(code, {'code': code})
            entry.setdefault('state', r.get('STATE', '').title())
            entry['totalElectors2024'] = parse_int(r.get('TOTAL ELECTORS', 0))
            entry['maleElectors2024'] = parse_int(r.get('MALE ELECTORS', 0))
            entry['femaleElectors2024'] = parse_int(r.get('FEMALE ELECTORS', 0))
    
    # ── DUN Demographics by state (where available) ──
    dun_files = {
        'NSN': ('2024 ELECTORAL DEMOGRAPHICS/NEGERI_SEMBILAN_APRIL_2024_DUN_COMPOSITION.csv', 'N'),
        'PHG': ('2024 ELECTORAL DEMOGRAPHICS/PAHANG_AUGUST_2024_DUN_COMPOSITION.csv', 'N'),
        'SBH': ('2024 ELECTORAL DEMOGRAPHICS/SABAH_AUGUST_2024_DUN_COMPOSITION.csv', 'N'),
    }
    
    for state_key, (filepath, prefix) in dun_files.items():
        rows = fetch_csv(filepath)
        if not rows:
            continue
        for r in rows:
            raw_code = r.get('STATE CONSTITUENCY CODE', '').strip()
            if not raw_code:
                continue
            code = clean_code(raw_code)
            store_key = f"{state_key}_{code}"
            
            entry = result.setdefault(store_key, {
                'code': store_key,
                'dunCode': code,
                'dunName': r.get('STATE CONSTITUENCY NAME', '').strip(),
                'state': r.get('STATE', '').title(),
                'dun': True,
            })
            entry['dun'] = True
            entry.setdefault('state', r.get('STATE', '').title())
            entry['totalElectors2024'] = parse_int(r.get('TOTAL ELECTORS', 0))
            entry['maleElectors'] = parse_int(r.get('MALE ELECTORS', 0) or 0)
            entry['femaleElectors'] = parse_int(r.get('FEMALE ELECTORS', 0) or 0)
            entry['age18to20'] = parse_int(r.get('18 - 20', 0))
            entry['age21to29'] = parse_int(r.get('21 - 29', 0))
            entry['age30to39'] = parse_int(r.get('30 - 39', 0))
            entry['age40to49'] = parse_int(r.get('40 - 49', 0))
            entry['age50to59'] = parse_int(r.get('50 - 59', 0))
            entry['age60to69'] = parse_int(r.get('60 - 69', 0))
            entry['age70to79'] = parse_int(r.get('70 - 79', 0))
            entry['age80to89'] = parse_int(r.get('80 - 89', 0))
            entry['age90plus'] = parse_int(r.get('90 AND ABOVE', 0))
            entry['electorsOrdinary'] = parse_int(r.get('ELECTORS - ORDINARY VOTERS', 0))
            entry['electorsPolice'] = parse_int(r.get('ELECTORS - POLICE', 0))
            entry['electorsMilitary'] = parse_int(r.get('ELECTORS - MILITARY', 0))
    
    return result


def merge_data(economic, demographics, existing):
    """Merge economic + demographics into existing (preserve historical data)."""
    merged = dict(existing) if existing else {}
    
    # Merge economic data into the right regions
    for code, data in economic.items():
        if code not in merged:
            merged[code] = data
        else:
            merged[code].update(data)
    
    # Merge demographics
    for code, data in demographics.items():
        if code not in merged:
            merged[code] = data
        else:
            merged[code].update(data)
    
    return merged


def main():
    os.makedirs(KV_OUTPUT, exist_ok=True)
    
    print("=" * 60)
    print("📊 Tindak Malaysia — General-Election-Data")
    print("    Economic Data + Demographics")
    print("=" * 60)
    
    # Step 1: Economic data
    print("\n📈 Economic Data...")
    economic = process_economic_data()
    print(f"    → {len(economic)} regions with economic data")
    
    # Step 2: Demographics
    print("\n👥 Demographics...")
    demographics = fetch_all_demographics()
    print(f"    → {len(demographics)} regions with demographics")
    
    # Step 3: Load existing demographics-real.json
    existing_path = KV_OUTPUT / 'demographics-real.json'
    existing = {}
    if existing_path.exists():
        with open(existing_path) as f:
            existing = json.load(f)
        print(f"\n📦 Loaded existing: {len(existing)} regions")
    
    # Step 4: Merge
    merged = merge_data(economic, demographics, existing)
    
    # Step 5: Stats
    par_codes = {k for k in merged if k.startswith('P')}
    dun_codes = {k for k in merged if '_' in k}
    has_income = sum(1 for v in merged.values() if v.get('medianIncome2022'))
    has_gini = sum(1 for v in merged.values() if v.get('gini2022'))
    has_poverty = sum(1 for v in merged.values() if v.get('povertyRate2022'))
    has_demographics = sum(1 for v in merged.values() if v.get('age18to20'))
    
    print(f"\n{'='*60}")
    print("📊 FINAL STATISTICS")
    print(f"{'='*60}")
    print(f"  Total regions:          {len(merged)}")
    print(f"  PARLIMEN (Pxxx):        {len(par_codes)}")
    print(f"  DUN (XXX_Nxx):          {len(dun_codes)}")
    print(f"  With medianIncome:      {has_income}")
    print(f"  With GINI:              {has_gini}")
    print(f"  With povertyRate:       {has_poverty}")
    print(f"  With age demographics:  {has_demographics}")
    
    # Per-state
    states = set()
    for v in merged.values():
        if v.get('state'):
            states.add(v['state'])
    print(f"  States:                 {len(states)}")
    
    # Save
    out_path = KV_OUTPUT / 'economic-demographics.json'
    # Sort by code
    sorted_merged = {k: merged[k] for k in sorted(merged.keys())}
    with open(out_path, 'w') as f:
        json.dump(sorted_merged, f, indent=2, ensure_ascii=False)
    
    file_size = out_path.stat().st_size / 1024
    print(f"\n  💾 Saved: {out_path.name} ({file_size:.0f} KB)")
    
    # Also update demographics-real.json (partial backward compat)
    # Merge new demographic data into demographics-real.json structure
    demog_real = dict(existing)
    for code, data in merged.items():
        if code not in demog_real:
            # Create entry that matches existing structure
            entry = {
                'code': code,
            }
            # Copy relevant fields
            for field in ['state', 'parName', 'dunName', 'dun', 'parlimen',
                         'totalElectors2024', 'totalElectors2025',
                         'maleElectors', 'femaleElectors',
                         'age18to20', 'age21to29', 'age30to39',
                         'age40to49', 'age50to59', 'age60to69',
                         'age70to79', 'age80to89', 'age90plus',
                         'medianIncome2022', 'medianIncome2019',
                         'gini2022', 'gini2019',
                         'povertyRate2022', 'povertyRate2019',
                         'ethnicClass2022']:
                if field in data and data[field]:
                    entry[field] = data[field]
            demog_real[code] = entry
        else:
            # Update existing — add new data but don't overwrite old
            for field in ['state', 'parName', 'dunName']:
                if field in data and data[field] and not demog_real[code].get(field):
                    demog_real[code][field] = data[field]
    
    with open(existing_path, 'w') as f:
        json.dump(demog_real, f, indent=2, ensure_ascii=False)
    print(f"  💾 Updated: {existing_path.name} ({len(demog_real)} regions)")
    
    return merged


if __name__ == '__main__':
    main()

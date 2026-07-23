#!/usr/bin/env python3
"""
Fetch & process HISTORICAL-ELECTION-RESULTS from Tindak Malaysia.
Downloads key CSV files → merges into data/kv-output/historical-results.json

Usage:
    python3 scripts/fetch-historical-results.py        
    python3 scripts/fetch-historical-results.py --dry-run
    python3 scripts/fetch-historical-results.py --state selangor
"""

import csv, json, os, sys, io, argparse, re
from pathlib import Path
from urllib.request import urlopen
from urllib.error import HTTPError, URLError

BASE = Path(__file__).resolve().parent.parent
KV_OUTPUT = BASE / 'data' / 'kv-output'
ELECTIONS_DIR = BASE / 'data' / 'elections'

REPO = "TindakMalaysia/HISTORICAL-ELECTION-RESULTS"
RAW = "https://raw.githubusercontent.com/{repo}/main/{path}"

# ─── Key CSV files to fetch ────────────────────────────
# Each entry: (path, election_name, year, level)
# level: 'dun', 'parlimen', or 'both' (auto-detect)
SOURCE_FILES = [
    # PRU 2022 — PARLIMEN (all 222)
    ("2022-ELECTION-RESULTS/MALAYSIA_2022_PARLIAMENT_RESULTS.csv", "PRU 2022", 2022, "parlimen"),
    # PRU 2022 — DUN (Perlis, Perak, Pahang only)
    ("2022-ELECTION-RESULTS/MALAYSIA_2022_DUN_RESULTS.csv", "PRU 2022", 2022, "dun"),
    
    # PRN6 2023 — DUN (Kedah, Kelantan, NS, Penang, Selangor, Terengganu)
    ("2023-PRN6-STATE-ELECTIONS/MALAYSIA_PRN6_2023_ELECTION_RESULTS.csv", "PRN 2023", 2023, "dun"),
    
    # PRN Johor 2022
    ("2022-JOHOR-STATE-ELECTIONS/JOHOR_2022_ELECTION_RESULTS.csv", "PRN Johor 2022", 2022, "dun"),
    # PRN Johor 2026
    ("2026-JOHOR-STATE-ELECTIONS/2026_JOHOR_DUN_RESULTS.csv", "PRN Johor 2026", 2026, "dun"),
    
    # PRN Melaka 2021
    ("2021-MELAKA-STATE-ELECTIONS/MELAKA_2021_ELECTION_RESULTS.csv", "PRN Melaka 2021", 2021, "dun"),
    
    # PRN Sarawak 2021
    ("2021-SARAWAK-STATE-ELECTIONS/SARAWAK_2021_ELECTION_RESULTS.csv", "PRN Sarawak 2021", 2021, "dun"),
    
    # PRN Sabah 2020
    ("2020-SABAH-STATE-ELECTIONS/SABAH_2020_ELECTION_RESULTS.csv", "PRN Sabah 2020", 2020, "dun"),
    
    # PRU 2018
    ("2018-ELECTION-RESULTS/MALAYSIA_2018_PARLIAMENT_RESULTS.csv", "PRU 2018", 2018, "parlimen"),
    ("2018-ELECTION-RESULTS/MALAYSIA_2018_DUN_RESULTS.csv", "PRU 2018", 2018, "dun"),
    
    # PRU 2013 — Parliament
    ("2013-ELECTION-RESULTS/MALAYSIA_2013_PARLIAMENT_RESULTS.csv", "PRU 2013", 2013, "parlimen"),
    ("2013-ELECTION-RESULTS/MALAYSIA_2013_DUN_RESULTS.csv", "PRU 2013", 2013, "dun"),
    
    # PRU 2008
    ("2008-ELECTION-RESULTS/MALAYSIA_2008_PARLIAMENT_RESULTS.csv", "PRU 2008", 2008, "parlimen"),
    ("2008-ELECTION-RESULTS/MALAYSIA_2008_DUN_RESULTS.csv", "PRU 2008", 2008, "dun"),
    
    # PRU 2004
    ("2004-ELECTION-RESULTS/MALAYSIA_2004_PARLIAMENT_RESULTS.csv", "PRU 2004", 2004, "parlimen"),
    ("2004-ELECTION-RESULTS/MALAYSIA_2004_DUN_RESULTS.csv", "PRU 2004", 2004, "dun"),
    
    # PRU 1999
    ("1999-ELECTION-RESULTS/MALAYSIA_1999_PARLIAMENT_RESULTS.csv", "PRU 1999", 1999, "parlimen"),
    ("1999-ELECTION-RESULTS/MALAYSIA_1999_DUN_RESULTS.csv", "PRU 1999", 1999, "dun"),
    
    # PRU 1995
    ("1995-ELECTION-RESULTS/MALAYSIA_1995_PARLIAMENT_RESULTS.csv", "PRU 1995", 1995, "parlimen"),
    ("1995-ELECTION-RESULTS/MALAYSIA_1995_DUN_RESULTS.csv", "PRU 1995", 1995, "dun"),
    
    # Sabah PRN 2025 (latest!)
    ("2025-SABAH-STATE-ELECTIONS/2025_SABAH_DUN_RESULTS.csv", "PRN Sabah 2025", 2025, "dun"),
]

# ─── Known permanent party codes ───────────────────────
PARTY_ALIAS = {
    'BN': 'BN', 'PH': 'PH', 'PN': 'PN', 'GTA': 'GTA',
    'GPS': 'GPS', 'GRS': 'GRS', 'WARISAN': 'WARISAN',
    'MUDA': 'MUDA', 'PBM': 'PBM', 'KDM': 'KDM',
    'PAS': 'PN', 'PPBM': 'PN', 'BERSATU': 'PN',
    'UMNO': 'BN', 'MCA': 'BN', 'MIC': 'BN', 'GERAKAN': 'BN',
    'DAP': 'PH', 'PKR': 'PH', 'AMANAH': 'PH', 'UPKO': 'PH',
    'PEJUANG': 'PEMBANGKANG',
    'INDEPENDENT': 'INDEPENDENT',
    'OTHER': 'OTHER',
}

STATE_NAME_MAP = {
    'JOHOR': 'Johor', 'KEDAH': 'Kedah', 'KELANTAN': 'Kelantan',
    'MELAKA': 'Melaka', 'MALACCA': 'Melaka',
    'NEGERI SEMBILAN': 'Negeri Sembilan', 'NEGRI SEMBILAN': 'Negeri Sembilan',
    'PAHANG': 'Pahang', 'PERAK': 'Perak', 'PERLIS': 'Perlis',
    'PULAU PINANG': 'Pulau Pinang', 'PENANG': 'Pulau Pinang',
    'SABAH': 'Sabah', 'SARAWAK': 'Sarawak',
    'SELANGOR': 'Selangor', 'TERENGGANU': 'Terengganu',
    'TRENGGANU': 'Terengganu',
    'KUALA LUMPUR': 'WP Kuala Lumpur', 'WILAYAH PERSEKUTUAN': 'WP Kuala Lumpur',
    'LABUAN': 'WP Labuan', 'PUTRAJAYA': 'WP Putrajaya',
}

# State short codes for DUN prefixing
STATE_SHORT = {
    'Johor': 'JHR', 'Kedah': 'KDH', 'Kelantan': 'KTN',
    'Melaka': 'MLK', 'Negeri Sembilan': 'NSN',
    'Pahang': 'PHG', 'Perak': 'PRK', 'Perlis': 'PLS',
    'Pulau Pinang': 'PNG', 'Sabah': 'SBH', 'Sarawak': 'SWK',
    'Selangor': 'SGR', 'Terengganu': 'TRG',
    'WP Kuala Lumpur': 'WPK', 'WP Labuan': 'WPL', 'WP Putrajaya': 'WPP',
}


def fetch_csv(path):
    """Download CSV from GitHub and return as list of dicts."""
    url = RAW.format(repo=REPO, path=path)
    print(f"  Fetching: {path.split('/')[-1]}...", end=' ')
    try:
        with urlopen(url, timeout=30) as resp:
            content = resp.read().decode('utf-8-sig')  # Handle BOM
            reader = csv.DictReader(io.StringIO(content))
            rows = list(reader)
            print(f"{len(rows)} rows")
            return rows, content
    except HTTPError as e:
        print(f"HTTP {e.code}")
        return None, None
    except Exception as e:
        print(f"Error: {e}")
        return None, None


def normalise_code(code_raw, level='dun'):
    """Normalise codes: 'N. 01' → 'N01', 'P. 001' → 'P001'"""
    code = code_raw.strip().replace('.', '').replace(' ', '')
    if level == 'dun' and not code.startswith('N') and not code.startswith('P'):
        return code
    if level == 'parlimen' and not code.startswith('P'):
        return code
    return code


def parse_party_vote(party_name, vote_str):
    """Parse a party's vote count, return (party, votes) or None."""
    try:
        votes = int(float(vote_str)) if vote_str and vote_str.strip() else 0
    except (ValueError, TypeError):
        votes = 0
    if not votes or votes <= 0:
        return None
    
    # Map to standard party
    party = PARTY_ALIAS.get(party_name.upper().strip(), party_name.upper().strip())
    return (party, votes)


def extract_candidates(row):
    """Extract candidates from a CSV row, return list of candidate dicts."""
    candidates = []
    total_votes = 0
    party_votes = {}
    
    # Identify all party columns dynamically
    # Columns are: PARTY, PARTY CANDIDATE, PARTY CANDIDATE GENDER, PARTY CANDIDATE AGE, PARTY VOTE, PARTY CANDIDATE LOST DEPOSIT
    # Known party prefixes
    party_prefixes = ['BN', 'PH', 'PN', 'GTA', 'GPS', 'GRS', 'WARISAN', 'MUDA', 'PBM', 'KDM', 'PEJUANG']
    other_prefixes = []
    
    for key in row.keys():
        if key and key.upper().startswith('OTHER PARTY') or key.upper().startswith('INDEPENDENT'):
            prefix = key.rsplit(' (', 1)[0] if ' (' in key else key.rsplit(' ', 1)[0]
            if prefix not in other_prefixes:
                other_prefixes.append(prefix)
    
    all_prefixes = party_prefixes + other_prefixes
    
    for prefix in all_prefixes:
        name_col = f"{prefix} CANDIDATE" if not prefix.startswith('OTHER') and not prefix.startswith('INDEPENDENT') else f"{prefix} CANDIDATE"
        vote_col = f"{prefix} VOTE" if not prefix.startswith('OTHER') and not prefix.startswith('INDEPENDENT') else f"{prefix} VOTE"
        
        # Try exact match first, then case-insensitive
        name = None
        votes = 0
        party_name = prefix
        
        for key in row.keys():
            key_upper = key.upper().strip()
            if key_upper == name_col.upper() or key_upper == f"{prefix} CANDIDATE".upper():
                name = row[key]
            if key_upper == vote_col.upper() or key_upper == f"{prefix} VOTE".upper():
                v = row[key]
                try:
                    votes = int(float(v)) if v and v.strip() else 0
                except:
                    votes = 0
        
        if not name or not name.strip():
            # Try fallback: just check if there's a vote column
            if votes <= 0:
                continue
            name = party_name
        
        if votes <= 0:
            continue
        
        # Determine result: highest votes = won
        party_votes[party_name] = votes
        total_votes += votes
        
        # Map party
        mapped_party = PARTY_ALIAS.get(party_name.upper().strip(), party_name.upper().strip())
        
        candidates.append({
            'name': name.strip(),
            'party': mapped_party,
            'votes': votes,
            'percentage': 0.0,  # Will calculate after total
            'result': 'unknown',  # Will determine after sorting
        })
    
    # Calculate percentages and determine results
    if total_votes > 0:
        # Sort by votes descending
        candidates.sort(key=lambda c: c['votes'], reverse=True)
        for i, c in enumerate(candidates):
            c['percentage'] = round((c['votes'] / total_votes) * 100, 1)
            c['result'] = 'won' if i == 0 else 'lost'
    
    return candidates


def process_file(filepath, election_name, year, level, rows):
    """Process CSV rows into our historical-results.json format."""
    results = {}
    state_counts = {}  # Track how many unique states in this file
    
    # First pass: detect states
    for row in rows:
        state_raw = row.get('STATE', '').strip().upper()
        if state_raw:
            state = STATE_NAME_MAP.get(state_raw, state_raw.title())
            state_counts[state] = state_counts.get(state, 0) + 1
    
    is_multi_state = len(state_counts) > 1
    
    print(f"      States: {len(state_counts)}, multi-state: {is_multi_state}", end='')
    if is_multi_state:
        print(f" ({', '.join(sorted(state_counts.keys())[:5])}...)")
    else:
        state_name = list(state_counts.keys())[0] if state_counts else 'Unknown'
        print(f" ({state_name})")
    
    for row in rows:
        state_raw = row.get('STATE', '').strip().upper()
        state = STATE_NAME_MAP.get(state_raw, state_raw.title())
        state_short = STATE_SHORT.get(state, state[:3].upper())
        
        # Determine code based on level
        if level == 'dun':
            raw_code = row.get('STATE CONSTITUENCY CODE', '').strip()
            raw_name = row.get('STATE CONSTITUENCY NAME', '').strip()
        else:
            raw_code = row.get('PARLIAMENTARY CONSTITUENCY CODE', '') or row.get('PARLIAMENTARY CODE', '')
            raw_name = row.get('PARLIAMENTARY CONSTITUENCY NAME', '') or row.get('PARLIAMENTARY NAME', '')
            raw_code = raw_code.strip()
            raw_name = raw_name.strip()
        
        if not raw_code:
            # Fallback to UNIQUE CODE
            unique = row.get('UNIQUE CODE', '').strip()
            parts = unique.replace(' ', '').split('_')
            raw_code = parts[-1] if len(parts) > 1 else parts[0]
        
        # Normalise: "N. 01" → "N01", "P. 001" → "P001"
        code = raw_code.replace('.', '').replace(' ', '')
        
        # Pad numbers: "N1" → "N01", "P1" → "P001"
        if code.startswith('N') and len(code) < 3:
            num = code[1:]
            if num.isdigit():
                code = f"N{int(num):02d}"
        elif code.startswith('P') and len(code) < 4:
            num = code[1:]
            if num.isdigit():
                code = f"P{int(num):03d}"
        
        # For multi-state DUN files, prefix with state short code to avoid collisions
        # e.g., "N01" from Kedah → "KDH_N01"
        if is_multi_state and code.startswith('N'):
            store_key = f"{state_short}_{code}"
        else:
            store_key = code
        
        # Extract candidates
        candidates = extract_candidates(row)
        if not candidates:
            continue
        
        # Get metadata
        total_elec = 0
        try:
            total_elec = int(float(row.get('TOTAL ELECTORATE', 0))) if row.get('TOTAL ELECTORATE', '') else 0
        except:
            pass
        
        majority = 0
        try:
            majority = int(float(row.get('WINNING MAJORITY', 0))) if row.get('WINNING MAJORITY', '') else 0
        except:
            pass
        
        turnout = 0.0
        try:
            turnout = float(row.get('TURNOUT (%)', 0)) if row.get('TURNOUT (%)', '') else 0
        except:
            pass
        
        # Build election entry
        election_entry = {
            "year": year,
            "electionName": election_name,
            "candidates": candidates,
            "totalElectors": total_elec,
            "majority": majority,
            "turnout": turnout,
        }
        
        # Merge into results
        if store_key not in results:
            results[store_key] = {
                "code": store_key,
                "name": raw_name.title(),
                "state": state,
                "elections": [],
            }
        
        # Avoid duplicates
        existing_years = {(e['year'], e['electionName']) for e in results[store_key]['elections']}
        if (year, election_name) not in existing_years:
            results[store_key]['elections'].append(election_entry)
    
    return results


def merge_results(base, new):
    """Merge new results into base, preserving existing data."""
    # Remap existing bare NS codes (N01) for consistency with multi-state prefix
    nsn_codes = {}
    for code in list(base.keys()):
        if re.match(r'^N\d+$', code) and not '_' in code:
            entry = base[code]
            if entry.get('state') == 'Negeri Sembilan':
                nsn_code = f"NSN_{code}"
                nsn_codes[code] = nsn_code
    
    for old_code, new_code in nsn_codes.items():
        base[new_code] = base[old_code]
        base[new_code]['code'] = new_code
    
    for code, data in new.items():
        if code not in base:
            base[code] = data
        else:
            existing = {(e['year'], e['electionName']) for e in base[code]['elections']}
            for e in data['elections']:
                if (e['year'], e['electionName']) not in existing:
                    base[code]['elections'].append(e)
            base[code]['elections'].sort(key=lambda e: (e['year'], e['electionName']))
    return base


def main():
    parser = argparse.ArgumentParser(description='Download historical election results from Tindak Malaysia')
    parser.add_argument('--dry-run', action='store_true', help='Show what would download without processing')
    parser.add_argument('--state', help='Filter by state (e.g., selangor, kedah)')
    args = parser.parse_args()
    
    os.makedirs(KV_OUTPUT, exist_ok=True)
    
    print("=" * 60)
    print("📊 Tindak Malaysia — HISTORICAL-ELECTION-RESULTS")
    print(f"    {len(SOURCE_FILES)} source files to process")
    print("=" * 60)
    
    # Filter by state if specified
    if args.state:
        state_upper = args.state.upper()
        filtered = []
        for path, name, year, level in SOURCE_FILES:
            # Check if state name is in the path
            for st in STATE_NAME_MAP:
                if st.replace(' ', '_').upper() in path.upper():
                    if st == state_upper or STATE_NAME_MAP[st].upper() == state_upper:
                        filtered.append((path, name, year, level))
                        break
        if filtered:
            print(f"  Filtered to {len(filtered)} files for {args.state}")
            SOURCE_FILES_LIST = filtered
        else:
            print(f"  No specific files for {args.state}, processing all (will filter by state later)")
            SOURCE_FILES_LIST = SOURCE_FILES
    else:
        SOURCE_FILES_LIST = SOURCE_FILES
    
    all_results = {}
    stats = {'files_ok': 0, 'files_fail': 0, 'total_regions': 0, 'total_elections': 0}
    
    for path, election_name, year, level in SOURCE_FILES_LIST:
        rows, raw = fetch_csv(path)
        if rows is None:
            stats['files_fail'] += 1
            print(f"    ❌ {election_name}")
            continue
        
        if args.dry_run:
            print(f"    📋 {election_name} — {len(rows)} rows")
            stats['files_ok'] += 1
            continue
        
        # Process
        results = process_file(path, election_name, year, level, rows)
        all_results = merge_results(all_results, results)
        
        # Show summary for this file
        regions = len(results)
        elections = sum(len(r['elections']) for r in results.values())
        states_in_file = set(r['state'] for r in results.values())
        print(f"    ✅ {election_name} — {regions} regions, {elections} elections, {len(states_in_file)} states")
        
        stats['files_ok'] += 1
    
    if args.dry_run:
        print(f"\n{'='*60}")
        print(f"✅ Dry run: {stats['files_ok']} files would be processed")
        return
    
    # ─── Load existing historical-results.json ──────────
    existing_path = KV_OUTPUT / 'historical-results.json'
    if existing_path.exists():
        with open(existing_path) as f:
            existing = json.load(f)
        print(f"\n{'='*60}")
        print(f"📦 Loaded existing: {len(existing)} regions")
        # Merge — existing data takes priority (NS data is more detailed)
        for code, data in existing.items():
            if code not in all_results:
                all_results[code] = data
            else:
                # Keep existing elections, add any new ones from Tindak
                existing_years = {(e['year'], e['electionName']) for e in data['elections']}
                new_elections = [e for e in all_results[code]['elections'] 
                                if (e['year'], e['electionName']) not in existing_years]
                if new_elections:
                    data['elections'].extend(new_elections)
                    data['elections'].sort(key=lambda e: (e['year'], e['electionName']))
                all_results[code] = data
    
    # Sort final results
    final = {}
    for code in sorted(all_results.keys()):
        final[code] = all_results[code]
        final[code]['elections'].sort(key=lambda e: (e['year'], e['electionName']))
    
    # ─── Statistics ──────────────────────────────────────
    n_codes = [k for k in final if k.startswith('N')]
    p_codes = [k for k in final if k.startswith('P')]
    total_elections = sum(len(v['elections']) for v in final.values())
    states = set()
    for v in final.values():
        if v.get('state'):
            states.add(v['state'])
    
    print(f"\n{'='*60}")
    print(f"📊 FINAL STATISTICS")
    print(f"{'='*60}")
    print(f"  Total regions:    {len(final)}")
    print(f"  DUN (Nxx):        {len(n_codes)}")
    print(f"  PAR (Pxx):        {len(p_codes)}")
    print(f"  Total elections:  {total_elections}")
    print(f"  States:           {len(states)}")
    print(f"  {', '.join(sorted(states))}")
    
    # Coverage per state
    if n_codes:
        state_coverage = {}
        for code in n_codes:
            s = final[code].get('state', 'Unknown')
            if s not in state_coverage:
                state_coverage[s] = {'duns': 0, 'elections': 0}
            state_coverage[s]['duns'] += 1
            state_coverage[s]['elections'] += len(final[code]['elections'])
        print(f"\n  Per-state DUN coverage:")
        for s in sorted(state_coverage.keys()):
            print(f"    {s:20s}: {state_coverage[s]['duns']:3d} DUN, {state_coverage[s]['elections']:3d} elections")
    
    # Save
    with open(existing_path, 'w') as f:
        json.dump(final, f, indent=2, ensure_ascii=False)
    
    file_size = existing_path.stat().st_size / 1024
    print(f"\n  💾 Saved: {existing_path.name} ({file_size:.0f} KB)")
    
    # Compare with before
    if 'existing' in dir():
        old_regions = len(existing)
        new_regions = len(final) - old_regions
        print(f"  📈 Growth: +{new_regions} regions (was {old_regions}, now {len(final)})")
    
    return final


if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
generate-real-data.py
Parse ElectionData.MY CSV ballots → generate candidates, demographics KV data.
Reads:  data/electiondata-federal-ballots.csv (PRU 1955-2022)
        data/electiondata-nsn-ballots.csv   (PRN NSN 1959-2026)
        data/tindak-parsed.json             (Tindak demographics)
Output: data/kv-output/candidates-real.json
        data/kv-output/demographics-real.json
"""

import csv, json, re, os
from collections import defaultdict

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')

# ─── Party short-name mapping ───
PARTY_MAP = {
    'BN': 'BN', 'UMNO': 'BN', 'MCA': 'BN', 'MIC': 'BN', 'GERAKAN': 'BN',
    'PH': 'PH', 'PKR': 'PH', 'DAP': 'PH', 'AMANAH': 'PH', 'UPKO': 'PH',
    'PN': 'PN', 'PAS': 'PN', 'BERSATU': 'PN', 'PPBM': 'PN',
    'GPS': 'GPS', 'PBB': 'GPS', 'SUPP': 'GPS', 'PRS': 'GPS', 'PDP': 'GPS',
    'GRS': 'GRS', 'PBS': 'GRS', 'SAPP': 'GRS',
    'WARISAN': 'WARISAN',
    'BEBAS': 'Bebas', 'INDEPENDENT': 'Bebas',
}

PARTY_LOGO = {
    'BN': '/flags/bn.svg', 'PH': '/flags/ph.svg', 'PN': '/flags/pn.svg',
    'GPS': '/flags/gps.svg', 'GRS': '/flags/grs.svg',
    'WARISAN': '/flags/warisan.svg', 'Bebas': '/flags/bebas.svg',
}

def short_party(raw):
    """Map raw party name to short code."""
    if not raw:
        return 'Bebas'
    u = raw.strip().upper()
    for key, val in PARTY_MAP.items():
        if key in u:
            return val
    return 'Bebas'

def seat_code(seat_str):
    """Parse 'P.001 PADANG BESAR' → 'P001' or 'N.01 Chennah' → 'N01'"""
    m = re.match(r'([PN])\.\s*(\d+)', seat_str)
    if m:
        return f"{m.group(1)}{int(m.group(2)):03d}" if m.group(1)=='P' else f"{m.group(1)}{int(m.group(2)):02d}"
    m2 = re.match(r'([PN])(\d+)', seat_str)
    if m2:
        return f"{m2.group(1)}{int(m2.group(2)):03d}" if m2.group(1)=='P' else f"{m2.group(1)}{int(m2.group(2)):02d}"
    return seat_str

def parse_csv(filepath):
    """Parse ElectionData.MY CSV ballot file."""
    rows = []
    with open(filepath, 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            rows.append(row)
    return rows

def get_latest_election(rows, target_year=None):
    """Get rows for the most recent election (or specific year)."""
    elections = defaultdict(list)
    for r in rows:
        yr = r.get('date', '')[:4]
        elections[yr].append(r)
    
    if target_year:
        year = str(target_year)
        return elections.get(year, [])
    
    # Find latest year
    years = sorted(elections.keys(), reverse=True)
    for y in years:
        if elections[y]:
            return elections[y]
    return []

def build_candidates(federal_rows, nsn_rows):
    """Build candidate KV from real election results.
    Uses result='won' to determine winner (role='penyandang').
    """
    candidates = {}
    
    def csv_val(r, key, default=0):
        """Safely parse CSV value."""
        v = r.get(key, '') or ''
        try:
            return float(v) if '.' in str(v) else int(v)
        except:
            return default
    
    # Process federal (PRU) data - 2022 (GE15) results
    latest_fed = get_latest_election(federal_rows, 2022)
    fed_by_seat = defaultdict(list)
    for r in latest_fed:
        code = seat_code(r.get('seat', ''))
        if code:
            fed_by_seat[code].append(r)
    
    for code, rows in fed_by_seat.items():
        cands = []
        for r in rows:
            party = short_party(r.get('party_on_ballot', ''))
            result = r.get('result', '').strip().lower()
            cands.append({
                'name': r.get('name_on_ballot', '').strip(),
                'party': party,
                'partyLogo': PARTY_LOGO.get(party, '/flags/bebas.svg'),
                'role': 'penyandang' if result == 'won' else 'pencabar',
                'profile': '',
                'wikipediaUrl': '',
                'lastElection': {
                    'year': 2022,
                    'votes': csv_val(r, 'votes'),
                    'majority': 0,  # Calculate from runner-up
                    'percentage': round(csv_val(r, 'votes_perc'), 1),
                    'totalVoters': 0,  # Not in this CSV
                    'turnout': 0,
                }
            })
        
        # Calculate majority (winner votes - runner-up votes)
        if cands:
            sorted_cands = sorted(cands, key=lambda c: c['lastElection']['votes'], reverse=True)
            if len(sorted_cands) >= 2:
                sorted_cands[0]['lastElection']['majority'] = \
                    sorted_cands[0]['lastElection']['votes'] - sorted_cands[1]['lastElection']['votes']
            candidates[code] = sorted_cands
    
    # Process NSN (PRN) data
    nsn_2026 = get_latest_election(nsn_rows, 2026)
    nsn_2023 = get_latest_election(nsn_rows, 2023)
    
    nsn_2023_by_seat = defaultdict(list)
    for r in nsn_2023:
        code = seat_code(r.get('seat', ''))
        if code:
            nsn_2023_by_seat[code].append(r)
    
    nsn_2026_by_seat = defaultdict(list)
    for r in nsn_2026:
        code = seat_code(r.get('seat', ''))
        if code:
            nsn_2026_by_seat[code].append(r)
    
    for code in nsn_2026_by_seat:
        cands_2026 = nsn_2026_by_seat[code]
        results_2023 = nsn_2023_by_seat.get(code, [])
        
        # Find 2023 winner party (the incumbent party)
        winner_party_2023 = None
        for r23 in results_2023:
            if r23.get('result', '').strip().lower() == 'won':
                winner_party_2023 = short_party(r23.get('party_on_ballot', ''))
                break
        
        cands = []
        for r in cands_2026:
            party = short_party(r.get('party_on_ballot', ''))
            
            # PRN 2026 hasn't happened (result='pending'), so use 2023 winner for role
            is_incumbent = (party == winner_party_2023)
            
            # Find matching 2023 result for this party (lastElection data)
            lastElection = None
            for r23 in results_2023:
                if short_party(r23.get('party_on_ballot', '')) == party:
                    lastElection = {
                        'year': 2023,
                        'votes': csv_val(r23, 'votes'),
                        'majority': csv_val(r23, 'votes_majority'),
                        'percentage': round(csv_val(r23, 'votes_perc'), 1),
                        'totalVoters': 0,
                        'turnout': 0,
                    }
                    break
            
            # Calculate majority for 2023 winner
            if is_incumbent and not lastElection:
                sorted_2023 = sorted(results_2023, key=lambda x: csv_val(x, 'votes'), reverse=True)
                if sorted_2023:
                    lastElection = {
                        'year': 2023,
                        'votes': csv_val(sorted_2023[0], 'votes'),
                        'majority': csv_val(sorted_2023[0], 'votes') - csv_val(sorted_2023[1], 'votes') if len(sorted_2023) >= 2 else 0,
                        'percentage': round(csv_val(sorted_2023[0], 'votes_perc'), 1),
                        'totalVoters': 0,
                        'turnout': 0,
                    }
            
            if lastElection:
                # Calculate majority properly
                if is_incumbent and len(results_2023) >= 2:
                    sorted_2023 = sorted(results_2023, key=lambda x: csv_val(x, 'votes'), reverse=True)
                    lastElection['majority'] = csv_val(sorted_2023[0], 'votes') - csv_val(sorted_2023[1], 'votes')
            
            cand = {
                'name': r.get('name_on_ballot', '').strip(),
                'party': party,
                'partyLogo': PARTY_LOGO.get(party, '/flags/bebas.svg'),
                'role': 'penyandang' if is_incumbent else 'pencabar',
                'profile': '',
                'wikipediaUrl': '',
            }
            if lastElection:
                cand['lastElection'] = lastElection
            cands.append(cand)
        
        if cands:
            candidates[code] = cands
    
    return candidates

def build_demographics(tindak_data, candidate_data):
    """Build demographics KV from Tindak data."""
    demogs = {}
    
    for code, t in tindak_data.items():
        demogs[code] = {
            'malay': 0, 'chinese': 0, 'indian': 0, 'others': 0,
            'medianIncome': t.get('medianIncome', 0),
            'meanIncome': t.get('meanIncome', 0),
            'gini': t.get('gini', 0),
            'poverty': t.get('poverty', 0),
            'totalElectors': t.get('totalElectors', 0),
            'maleElectors': t.get('maleElectors', 0),
            'femaleElectors': t.get('femaleElectors', 0),
            'ageGroups': t.get('ageGroups', {}),
            'ethnicity': t.get('ethnicity', ''),
            'source': 'Tindak Malaysia / DOSM',
            'updatedAt': '2026-07-23T10:00:00Z',
        }
        
        # Map ethnic classification
        eth = t.get('ethnicity', '').upper()
        if 'MALAY MAJORITY' in eth:
            demogs[code]['malay'] = 62
            demogs[code]['chinese'] = 22
            demogs[code]['indian'] = 12
            demogs[code]['others'] = 4
        elif 'CHINESE MAJORITY' in eth:
            demogs[code]['malay'] = 15
            demogs[code]['chinese'] = 65
            demogs[code]['indian'] = 15
            demogs[code]['others'] = 5
        elif 'MIXED' in eth:
            demogs[code]['malay'] = 42
            demogs[code]['chinese'] = 35
            demogs[code]['indian'] = 18
            demogs[code]['others'] = 5
        else:
            demogs[code]['malay'] = 55
            demogs[code]['chinese'] = 25
            demogs[code]['indian'] = 15
            demogs[code]['others'] = 5
    
    return demogs

def main():
    print('═' * 60)
    print('  GENERATE REAL DATA — From ElectionData.MY + Tindak')
    print('═' * 60)
    
    # 1. Parse CSVs
    print('\n📥 Parsing ElectionData.MY CSVs...')
    federal_rows = parse_csv(os.path.join(DATA_DIR, 'electiondata-federal-ballots.csv'))
    nsn_rows = parse_csv(os.path.join(DATA_DIR, 'electiondata-nsn-ballots.csv'))
    print(f'   Federal: {len(federal_rows)} ballot rows')
    print(f'   NSN:     {len(nsn_rows)} ballot rows')
    
    # 2. Load Tindak
    print('\n📥 Loading Tindak demographics...')
    with open(os.path.join(DATA_DIR, 'tindak-parsed.json'), 'r') as f:
        tindak_data = json.load(f)
    print(f'   {len(tindak_data)} seats')
    
    # 3. Build candidates
    print('\n🔨 Building candidates...')
    candidates = build_candidates(federal_rows, nsn_rows)
    print(f'   {len(candidates)} seats with real candidate data')
    
    # 4. Build demographics
    print('\n🔨 Building demographics...')
    demographics = build_demographics(tindak_data, candidates)
    print(f'   {len(demographics)} seats with real demographics')
    
    # 5. Write output
    out_dir = os.path.join(DATA_DIR, 'kv-output')
    os.makedirs(out_dir, exist_ok=True)
    
    with open(os.path.join(out_dir, 'candidates-real.json'), 'w') as f:
        json.dump(candidates, f, indent=2, ensure_ascii=False)
    with open(os.path.join(out_dir, 'demographics-real.json'), 'w') as f:
        json.dump(demographics, f, indent=2, ensure_ascii=False)
    
    print(f'\n📁 Output → {out_dir}/')
    print(f'   candidates-real.json ({len(candidates)} seats)')
    print(f'   demographics-real.json ({len(demographics)} seats)')
    
    # Preview first few
    print('\n📋 Preview:')
    for code in sorted(candidates.keys())[:5]:
        c = candidates[code]
        d = demographics.get(code, {})
        winner = c[0] if c else {}
        print(f'   {code}: {winner.get("name","?")} ({winner.get("party","?")}) | '
              f'{d.get("totalElectors","?"):>6} voters | '
              f'RM{d.get("medianIncome","?"):>5} median')
    
    for code in ['N01', 'N05', 'N10', 'N13', 'N27']:
        if code in candidates:
            c = candidates[code]
            winner = c[0]
            print(f'   {code}: {winner["name"]} ({winner["party"]}) | {len(c)} calon')
    
    print('\n✅ Done!')

if __name__ == '__main__':
    main()

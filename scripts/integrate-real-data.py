#!/usr/bin/env python3
"""
integrate-real-data.py
Generate kv.ts mock data section replacement from real data files.
Merges: ElectionData.MY candidates + Tindak demographics
Output: prints TypeScript code to stdout
"""
import json, os, sys

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data')
TEMPLATE_FILE = os.path.join(os.path.dirname(__file__), '..', 'src', 'lib', 'kv.ts')

def load_json(path):
    with open(path) as f:
        return json.load(f)

def main():
    candidates = load_json(os.path.join(DATA_DIR, 'kv-output', 'candidates-real.json'))
    demographics = load_json(os.path.join(DATA_DIR, 'kv-output', 'demographics-real.json'))
    tindak = load_json(os.path.join(DATA_DIR, 'tindak-parsed.json'))
    
    # Count stats
    parlimen = {k: v for k, v in candidates.items() if k.startswith('P')}
    dun = {k: v for k, v in candidates.items() if k.startswith('N')}
    print(f'Loaded: {len(candidates)} seats ({len(parlimen)} P + {len(dun)} N)', file=sys.stderr)
    
    # Generate TypeScript mockCandidates
    lines = []
    lines.append("// ═══════════════════════════════════════════════════════════════")
    lines.append("// REAL ELECTION DATA — From ElectionData.MY (SPR / Open Data)")
    lines.append("// Generated from: data/electiondata-federal-ballots.csv")
    lines.append("//                + data/electiondata-nsn-ballots.csv")
    lines.append("//                + data/tindak-parsed.json")
    lines.append("// ═══════════════════════════════════════════════════════════════")
    lines.append("")
    
    # Mock candidates
    lines.append("const mockCandidates: Record<string, any[]> = {")
    
    # Map party names for display
    party_display = {
        'BN': 'Barisan Nasional', 'PH': 'Pakatan Harapan', 'PN': 'Perikatan Nasional',
        'GPS': 'Gabungan Parti Sarawak', 'GRS': 'Gabungan Rakyat Sabah',
        'WARISAN': 'Warisan', 'Bebas': 'Bebas',
    }
    
    for code in sorted(candidates.keys(), key=lambda c: (c[0], int(c[1:]))):
        cands = candidates[code]
        lines.append(f"  '{code}': [")
        for i, c in enumerate(cands):
            le = c.get('lastElection')
            last_el = ''
            if le and le.get('votes'):
                last_el = f",\n        lastElection: {{ year: {le['year']}, votes: {le['votes']}, majority: {le['majority']}, percentage: {le['percentage']}, totalVoters: 0, turnout: 0 }}"
            
            comma = ',' if i < len(cands) - 1 else ''
            lines.append(f"    {{ name: '{c['name']}', party: '{c['party']}', partyLogo: '{c['partyLogo']}', role: '{c['role']}'{last_el} }}{comma}")
        lines.append("  ],")
    
    lines.append("}")
    lines.append("")
    
    # Mock demographics
    lines.append("const mockDemographics: Record<string, any> = {")
    for code in sorted(demographics.keys(), key=lambda c: (c[0], int(c[1:]))):
        d = demographics[code]
        # Use N-series mock data from tindak if available
        if code.startswith('N') and code not in tindak:
            # Generate reasonable defaults for state seats
            lines.append(f"  '{code}': {{ malay: {d.get('malay',55)}, chinese: {d.get('chinese',25)}, indian: {d.get('indian',15)}, others: {d.get('others',5)}, medianIncome: {d.get('medianIncome',4800)}, poverty: {d.get('poverty',3.0)}, gini: {d.get('gini',0.320)}, totalElectors: {d.get('totalElectors',25000)} }},")
        else:
            lines.append(f"  '{code}': {{ malay: {d.get('malay',55)}, chinese: {d.get('chinese',25)}, indian: {d.get('indian',15)}, others: {d.get('others',5)}, medianIncome: {d.get('medianIncome',0)}, poverty: {d.get('poverty',0)}, gini: {d.get('gini',0)}, totalElectors: {d.get('totalElectors',0)} }},")
    lines.append("}")
    
    output = '\n'.join(lines)
    
    # Also generate a simple JSON version
    out_dir = os.path.join(DATA_DIR, 'kv-output')
    with open(os.path.join(out_dir, 'kv-ts-output.txt'), 'w') as f:
        f.write(output)
    
    print(f'\n✅ Written to {out_dir}/kv-ts-output.txt', file=sys.stderr)
    print(f'   Candidates: {len(candidates)} seats', file=sys.stderr)
    print(f'   Demographics: {len(demographics)} seats', file=sys.stderr)

if __name__ == '__main__':
    main()

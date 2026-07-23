#!/usr/bin/env python3
"""Analyse existing GeoJSON + mapping data for all states."""

import json, os, sys
from pathlib import Path

BASE = Path(__file__).resolve().parent.parent
PUBLIC_GEOJSON = BASE / 'public' / 'geojson'
KV_OUTPUT = BASE / 'data' / 'kv-output'
ELECTIONS = BASE / 'data' / 'elections'

print("=" * 60)
print("EXISTING GEOJSON FILES")
print("=" * 60)
for f in sorted(PUBLIC_GEOJSON.glob('*.json')):
    with open(f) as fh:
        data = json.load(fh)
    n = len(data.get('features', []))
    print(f"  {f.name:45s} {n} features  ({f.stat().st_size / 1024:.1f} KB)")

print()
print("=" * 60)
print("NS DUN POLYGON — PROPERTIES ANALYSIS")
print("=" * 60)
with open(PUBLIC_GEOJSON / 'prn_negeri9_dun_polygon.json') as f:
    ns_dun = json.load(f)

# Property keys
keys = set()
for feat in ns_dun['features']:
    keys.update(feat['properties'].keys())
print(f"Property keys: {sorted(keys)}")

# Extract DUN→PAR mapping
dun_to_par = {}
par_info = {}
for feat in ns_dun['features']:
    p = feat['properties']
    code = p['code']
    par = p['code_parlimen'].replace('.', '')  # "P.126" → "P126"
    dun_to_par[code] = par
    if par not in par_info:
        par_info[par] = {
            'name': p['parlimen'].split(' ', 1)[1] if ' ' in p['parlimen'] else p['parlimen'],
            'dun_count': 0,
            'state_code': p['state_code'],
        }
    par_info[par]['dun_count'] += 1

print(f"\nDUN→PAR mapping: {len(dun_to_par)} DUN, {len(par_info)} PAR")
print(f"Mapping sample: {dict(list(dun_to_par.items())[:5])}")
print(f"Parlimen info: {json.dumps(par_info, indent=2)}")

# Compare with config.json
print()
print("=" * 60)
print("CONFIG.JSON vs POLYGON (AUTHORITATIVE)")
print("=" * 60)
config_path = sorted(ELECTIONS.glob('*/config.json'))
if config_path:
    with open(config_path[0]) as f:
        config = json.load(f)
    cfg_map = config.get('dunToParlimen', {})
    
    # Find differences
    diff_count = 0
    for dun, par in sorted(dun_to_par.items()):
        if dun in cfg_map:
            if cfg_map[dun] != par:
                print(f"  ⚠️  {dun}: config says {cfg_map[dun]}, polygon says {par}")
                diff_count += 1
        else:
            print(f"  ❌ {dun}: missing from config")
            diff_count += 1
    if diff_count == 0:
        print("  ✅ Config matches polygon perfectly!")
    else:
        print(f"\n  ⚠️  {diff_count} differences found — config needs update")

print()
print("=" * 60)
print("PARLIMEN POLYGON — COVERAGE")
print("=" * 60)
with open(PUBLIC_GEOJSON / 'pru_parlimen_polygon.json') as f:
    par_poly = json.load(f)

state_par = {}
for feat in par_poly['features']:
    s = feat['properties'].get('state_name', 'unknown')
    state_par[s] = state_par.get(s, 0) + 1

print(f"Total PARLIMEN polygons: {len(par_poly['features'])}")
print("Per state:")
for s, n in sorted(state_par.items()):
    print(f"  {s:20s}: {n} PARLIMEN")

# Check what's missing (222 total Malaysia)
states_all = {
    'Perlis': 3, 'Kedah': 15, 'Kelantan': 14, 'Terengganu': 8,
    'Pulau Pinang': 13, 'Perak': 24, 'Pahang': 14,
    'Selangor': 22, 'Negeri Sembilan': 8, 'Melaka': 6, 'Johor': 26,
    'Sabah': 25, 'Sarawak': 31, 'WP Kuala Lumpur': 11, 'WP Putrajaya': 1, 'WP Labuan': 1
}
print("\nMissing PARLIMEN states:")
for s, n in sorted(states_all.items()):
    existing = state_par.get(s, 0)
    if existing < n:
        print(f"  ❌ {s:20s}: have {existing}/{n}")
    else:
        print(f"  ✅ {s:20s}: have {existing}/{n}")

print()
print("=" * 60)
print("KV OUTPUT FILES — COVERAGE")
print("=" * 60)
for f in sorted(KV_OUTPUT.glob('*.json')):
    if f.name == 'historical-results.json':
        with open(f) as fh:
            data = json.load(fh)
        n = len(data)
        n_codes = [k for k in data.keys() if k.startswith(('N', 'P'))]
        n_n = len([k for k in n_codes if k.startswith('N')])
        n_p = len([k for k in n_codes if k.startswith('P')])
        print(f"  {f.name:40s} {n} entries ({n_n} DUN, {n_p} PAR)")
    elif f.name.endswith('-real.json') or 'demographics' in f.name:
        with open(f) as fh:
            data = json.load(fh)
        if isinstance(data, dict):
            n = len(data)
            print(f"  {f.name:40s} {n} keys")
        else:
            print(f"  {f.name:40s} ({f.stat().st_size / 1024:.1f} KB)")

print()
print("=" * 60)
print("RECOMMENDATION")
print("=" * 60)
print("""
1. UPDATE config.json — polygon data shows different DUN→PAR mapping 
   for Rasah (P130), Rembau (P131), Port Dickson (P132), Tampin (P133)
   
2. DOWNLOAD from Tindak Malaysia Maps repos for all states:
   - Need: DUN + PARLIMEN polygon GeoJSON
   - Format: MultiPolygon with code, code_parlimen, state_code, etc.
   
3. AUTO-EXTRACT DUN→PAR from polygon properties — no manual mapping needed
   
4. States priority by PRN likelihood: 
   HIGH: Selangor, Kedah, Kelantan, Terengganu, Penang
   MEDIUM: Perak, Pahang, Johor, Melaka
   LOW: Sabah, Sarawak (separate system)
""")

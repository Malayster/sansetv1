#!/usr/bin/env python3
"""
Download GeoJSON polygon files from Tindak Malaysia Maps repos for all states.

Usage:
    python3 scripts/fetch-state-geojson.py              # Download all states
    python3 scripts/fetch-state-geojson.py --state selangor  # Single state
    python3 scripts/fetch-state-geojson.py --dry-run     # Show what would download

Output:
    public/geojson/{statecode}_dun_polygon.json        # DUN polygons
    public/geojson/{statecode}_parlimen_polygon.json   # PARLIMEN polygons
    data/elections/{statecode}/config.json              # Auto-generated config
"""

import json, os, sys, argparse
from pathlib import Path
from urllib.request import urlopen
from urllib.error import HTTPError, URLError

BASE = Path(__file__).resolve().parent.parent
PUBLIC_GEOJSON = BASE / 'public' / 'geojson'
ELECTIONS_DIR = BASE / 'data' / 'elections'

# State mapping: short name → Tindak Malaysia repo name
# From https://github.com/TindakMalaysia
STATES = {
    'perlis':     {'repo': 'Perlis-Maps',              'dun': 15, 'par': 3,  'code': 'PLS'},
    'kedah':      {'repo': 'Kedah-Maps',               'dun': 36, 'par': 15, 'code': 'KDH'},
    'kelantan':   {'repo': 'Kelantan-Maps',            'dun': 45, 'par': 14, 'code': 'KTN'},
    'terengganu': {'repo': 'Terengganu-Maps',          'dun': 32, 'par': 8,  'code': 'TRG'},
    'penang':     {'repo': 'Penang-Maps',              'dun': 40, 'par': 13, 'code': 'PNG'},
    'perak':      {'repo': 'Perak-Maps',               'dun': 59, 'par': 24, 'code': 'PRK'},
    'pahang':     {'repo': 'Pahang-Maps',              'dun': 42, 'par': 14, 'code': 'PHG'},
    'selangor':   {'repo': 'Selangor-Maps',            'dun': 56, 'par': 22, 'code': 'SGR'},
    'nsembilan':  {'repo': 'Negeri-Sembilan-Maps',     'dun': 36, 'par': 8,  'code': 'NSN'},
    'melaka':     {'repo': 'Malacca-Maps',             'dun': 28, 'par': 6,  'code': 'MLK'},
    'johor':      {'repo': 'Johor-Maps',               'dun': 56, 'par': 26, 'code': 'JHR'},
    'sabah':      {'repo': 'Sabah-Maps',               'dun': 73, 'par': 25, 'code': 'SBH'},
    'sarawak':    {'repo': 'Sarawak-Maps',             'dun': 82, 'par': 31, 'code': 'SWK'},
    'wp':         {'repo': 'Federal-Territories-Maps', 'dun': 0,  'par': 13, 'code': 'WPK'},
}

# GitHub raw content URL template
RAW = "https://raw.githubusercontent.com/TindakMalaysia/{repo}/master/{path}"


def fetch_json(url, label):
    """Fetch JSON from URL and parse."""
    print(f"  Fetching {label}...")
    try:
        with urlopen(url, timeout=30) as resp:
            data = json.loads(resp.read())
            return data
    except HTTPError as e:
        print(f"    HTTP {e.code}: {url}")
        return None
    except Exception as e:
        print(f"    Error: {e}")
        return None


def fetch_repo_tree(repo):
    """Get file listing from GitHub API for a repo."""
    url = f"https://api.github.com/repos/TindakMalaysia/{repo}/git/trees/master?recursive=1"
    print(f"  Listing repo {repo}...")
    try:
        with urlopen(url, timeout=15) as resp:
            tree = json.loads(resp.read())
            if 'tree' in tree:
                return [f['path'] for f in tree['tree']]
            return []
    except Exception as e:
        print(f"    Error listing {repo}: {e}")
        return []


def find_state_geojson(files, state_code):
    """Find DUN and PARLIMEN GeoJSON files from a list of repo files."""
    found = {'dun': None, 'parlimen': None, 'archive_dun': None, 'archive_par': None}
    
    for f in files:
        # DM files (post-redelineation, polling district level)
        if f.endswith('DM-4326.geojson') or f.endswith('DM-4326.json'):
            found['dun'] = f
        # Archive DUN files (2015 boundaries, DUN level)
        if 'Archive' in f and f.endswith('.geojson') and 'DUN' in f.upper() and 'PBT' not in f.upper():
            found['archive_dun'] = f
        # Archive PAR files (2015 boundaries, PAR level)
        if 'Archive' in f and f.endswith('.geojson') and 'PAR' in f.upper() and 'PBT' not in f.upper():
            found['archive_par'] = f
    
    return found


def aggregate_dm_to_dun(data):
    """Aggregate polling district (DM) level features to DUN level.
    
    DM files have ~800-900 features per state, each a Polygon/MultiPolygon
    at polling district level. We group by KODDUN + DUN_BARU and merge
    geometries into a single MultiPolygon per DUN.
    """
    if not data or 'features' not in data:
        return None
    
    # Group DM features by DUN code
    duns = {}  # KODDUN → {name, par_code, par_name, geometries: []}
    
    for feat in data['features']:
        p = feat.get('properties', {})
        dun_code = str(p.get('KODDUN', '')).strip()
        dun_name = str(p.get('DUN_BARU', '')).strip()
        par_code = str(p.get('KODPAR', '')).strip()
        par_name = str(p.get('PAR_BARU', '')).strip()
        state_name = str(p.get('STATE', '')).strip()
        voters = int(p.get('PENGUNDI_B', 0) or p.get('PENGUNDI', 0) or 0)
        
        if not dun_code or not dun_name:
            continue
        
        # Normalise: "17" → "N17", "098" → "P098"
        full_dun_code = f"N{int(dun_code):02d}" if dun_code.isdigit() else dun_code
        full_par_code = f"P{int(par_code):03d}" if par_code.isdigit() else par_code
        
        if full_dun_code not in duns:
            duns[full_dun_code] = {
                'name': dun_name.title(),
                'dun_code': full_dun_code,
                'par_code': full_par_code,
                'par_name': par_name.title(),
                'state_name': state_name,
                'geometries': [],
                'total_voters': 0,
                'dun_count': 0,
            }
        duns[full_dun_code]['geometries'].append(feat['geometry'])
        duns[full_dun_code]['total_voters'] = max(duns[full_dun_code]['total_voters'], voters)
        duns[full_dun_code]['dun_count'] += 1
    
    # Build DUN-level features by merging geometries
    features = []
    for dun_code in sorted(duns.keys()):
        info = duns[dun_code]
        geoms = info['geometries']
        
        # Collect all polygon coordinates into a single MultiPolygon
        all_coords = []
        for g in geoms:
            if g['type'] == 'Polygon':
                all_coords.append(g['coordinates'])
            elif g['type'] == 'MultiPolygon':
                all_coords.extend(g['coordinates'])
        
        # Calculate centroid from first polygon
        if all_coords and all_coords[0]:
            coords = all_coords[0][0]
            lats = [c[1] for c in coords]
            lngs = [c[0] for c in coords]
            lat = sum(lats) / len(lats)
            lng = sum(lngs) / len(lngs)
        else:
            lat, lng = 0, 0
        
        features.append({
            'type': 'Feature',
            'id': dun_code,
            'geometry': {
                'type': 'MultiPolygon',
                'coordinates': all_coords,
            },
            'properties': {
                'code': dun_code,
                'name': info['name'],
                'state_name': info['state_name'],
                'state': info['state_name'],
                'code_parlimen': info['par_code'],
                'parlimen': f"{info['par_code']} {info['par_name']}" if info['par_name'] else info['par_code'],
                'type': 'dun',
                'lat': lat,
                'lng': lng,
                'total_voters': info['total_voters'],
            }
        })
    
    return {'type': 'FeatureCollection', 'features': features}


def extract_properties(data):
    """Convert Tindak Malaysia GeoJSON to our standard format."""
    if not data or 'features' not in data:
        return None
    
    features = []
    for feat in data['features']:
        props = feat.get('properties', {})
        # Tindak properties vary by state, map to our standard keys
        new_props = {}
        
        # Try various property key patterns used across Tindak repos
        code = props.get('code') or props.get('CODE') or props.get('Code') or ''
        name = props.get('name') or props.get('NAME') or props.get('Name') or props.get('dun') or props.get('DUN') or ''
        state_name = props.get('state_name') or props.get('state') or props.get('STATE') or ''
        state_code = props.get('state_code') or props.get('state_id') or ''
        
        # code_parlimen might be embedded in various ways
        code_par = props.get('code_parlimen') or props.get('PARLIMEN') or props.get('parlimen') or ''
        parlimen_name = props.get('parlimen') or props.get('PARLIMEN_NAME') or ''
        
        lat = props.get('lat') or props.get('Lat') or props.get('LAT') or 0
        lng = props.get('lng') or props.get('Lng') or props.get('LNG') or props.get('lon') or 0
        
        new_props = {
            'code': str(code).replace(' ', '') if code else '',
            'name': str(name),
            'state_name': str(state_name),
            'state_code': str(state_code),
            'state': str(state_name),
            'parlimen': str(parlimen_name) if parlimen_name else str(code_par),
            'code_parlimen': str(code_par).replace(' ', '') if code_par else '',
            'type': 'dun' if code and 'N' in str(code) else 'parlimen',
            'lat': float(lat) if lat else 0,
            'lng': float(lng) if lng else 0,
        }
        
        # Clean P-code format: "P.126" → "P126"
        if new_props['code_parlimen'] and '.' in new_props['code_parlimen']:
            new_props['code_parlimen'] = new_props['code_parlimen'].replace('.', '')
        
        features.append({
            'type': 'Feature',
            'geometry': feat.get('geometry'),
            'properties': new_props,
        })
    
    return {'type': 'FeatureCollection', 'features': features}


def extract_dun_to_par(data):
    """Extract DUN→PAR mapping from polygon properties."""
    if not data:
        return {}, {}
    dun_to_par = {}
    par_info = {}
    for feat in data['features']:
        p = feat['properties']
        code = p.get('code', '')
        par = p.get('code_parlimen', '')
        par_name = p.get('parlimen', '')
        state = p.get('state_code', '')
        
        # Skip if not DUN
        if not code or not par:
            continue
        if not code.startswith(('N', 'N.')):
            continue
            
        # Clean codes
        code = code.replace('.', '').replace(' ', '')
        par = par.replace('.', '').replace(' ', '')
        
        dun_to_par[code] = par
        if par not in par_info:
            # Extract parlimen name from various formats
            name = par_name
            if ' ' in par_name:
                parts = par_name.split(' ', 1)
                if len(parts) > 1:
                    name = parts[1]
            elif par and name == par:
                name = ''  # Will update from existing data later
            
            par_info[par] = {
                'name': name,
                'dun_count': 0,
                'state_code': state,
            }
        par_info[par]['dun_count'] += 1
    
    return dun_to_par, par_info


def generate_config(state_name, state_code, dun_to_par, par_info):
    """Generate Election Pack config.json."""
    return {
        "electionId": f"prn-{state_name.lower().replace(' ', '-')}-template",
        "name": f"PRN {state_name} (Template)",
        "level": "dun",
        "parentLevel": "parlimen",
        "geoJson": f"prn_{state_code.lower()}_dun.json",
        "state": state_name,
        "dunToParlimen": dict(sorted(dun_to_par.items())) if dun_to_par else {},
        "parlimenInfo": {k: v for k, v in sorted(par_info.items())} if par_info else {},
        "demographicsSource": "parlimen",
        "dataSources": {
            "demographics": "Tindak Malaysia / DOSM",
            "historicalResults": "ElectionData.MY (fetch on-demand)",
            "geoJson": f"TindakMalaysia/{STATES.get(state_name.lower(), {}).get('repo', '')}",
        },
    }


def process_state(state_key, dry_run=False):
    """Download and process GeoJSON for one state."""
    info = STATES[state_key]
    repo = info['repo']
    state_name = state_key.capitalize() if state_key != 'nsembilan' else 'Negeri Sembilan'
    state_code = info['code']
    
    print(f"\n{'='*60}")
    print(f"Processing {state_name} ({state_code}) — {repo}")
    print(f"{'='*60}")
    
    # Fetch repo tree
    files = fetch_repo_tree(repo)
    if not files:
        print(f"  ⚠️  Could not list repo {repo}")
        return False
    
    # Find relevant GeoJSON files
    found = find_state_geojson(files, state_code)
    print(f"  ➤ DM file (post-redelineation): {found.get('dun', '❌ Not found')}")
    print(f"  ➤ Archive DUN (2015): {found.get('archive_dun', '❌ Not found')}")
    print(f"  ➤ Archive PARLIMEN: {found.get('archive_par', '❌ Not found')}")
    
    if dry_run:
        return found.get('dun') is not None
    
    success = False
    
    # ── Download DM file, aggregate to DUN level ──────────
    if found.get('dun'):
        url = RAW.format(repo=repo, path=found['dun'])
        data = fetch_json(url, "DM (Daerah Mengundi) GeoJSON")
        
        # Aggregate DM → DUN level
        processed = aggregate_dm_to_dun(data) if data else None
        if processed and processed['features']:
            dun_to_par, par_info = extract_dun_to_par(processed)
            n = len(processed['features'])
            print(f"    → Aggregated {len(data['features'])} DM → {n} DUN")
            print(f"    → {len(dun_to_par)} DUN mapped to {len(par_info)} PARLIMEN")
            
            if not dry_run:
                # Save DUN polygon
                out_path = PUBLIC_GEOJSON / f"prn_{state_code.lower()}_dun_polygon.json"
                with open(out_path, 'w') as f:
                    json.dump(processed, f, ensure_ascii=False)
                print(f"    ✅ Saved {out_path.name} ({processed['features'][0]['geometry']['type']}, {n} features)")
                
                # Centroid version
                centroid_features = []
                for feat in processed['features']:
                    p = dict(feat['properties'])
                    geom = feat['geometry']
                    if geom and geom['type'] == 'MultiPolygon' and geom['coordinates']:
                        coords = geom['coordinates'][0][0]
                        lats = [c[1] for c in coords]
                        lngs = [c[0] for c in coords]
                        p['lat'] = sum(lats) / len(lats)
                        p['lng'] = sum(lngs) / len(lngs)
                    centroid_features.append({
                        'type': 'Feature',
                        'geometry': {'type': 'Point', 'coordinates': [p['lng'], p['lat']]},
                        'properties': p,
                    })
                centroid_path = PUBLIC_GEOJSON / f"prn_{state_code.lower()}_dun.json"
                with open(centroid_path, 'w') as f:
                    json.dump({'type': 'FeatureCollection', 'features': centroid_features}, f, ensure_ascii=False)
                print(f"    ✅ Saved {centroid_path.name} ({len(centroid_features)} centroids)")
                
                # Generate Election Pack config
                if dun_to_par:
                    config = generate_config(state_name, state_code, dun_to_par, par_info)
                    state_dir = ELECTIONS_DIR / f"prn-{state_name.lower().replace(' ', '-')}-template"
                    os.makedirs(state_dir, exist_ok=True)
                    config_path = state_dir / 'config.json'
                    with open(config_path, 'w') as f:
                        json.dump(config, f, indent=2, ensure_ascii=False)
                    print(f"    ✅ Saved {config_path.relative_to(BASE)}")
                
                success = True
    
    # ── Also try PARLIMEN polygon if available ──────────────
    if found.get('archive_par'):
        url = RAW.format(repo=repo, path=found['archive_par'])
        data = fetch_json(url, "Archive PARLIMEN GeoJSON")
        
        if data and data.get('features'):
            # Standardise properties
            features = []
            for feat in data['features']:
                p = feat.get('properties', {})
                par_code = str(p.get('PAR_LAMA', '')).strip()
                par_name = str(p.get('Parliament', '')).strip()
                state_name = str(p.get('State', '')).strip()
                
                if not par_code:
                    continue
                
                # Calculate centroid
                geom = feat.get('geometry', {})
                lat, lng = 0, 0
                if geom and geom.get('coordinates'):
                    try:
                        coords = geom['coordinates'][0][0]
                        lats = [c[1] for c in coords]
                        lngs = [c[0] for c in coords]
                        lat = sum(lats) / len(lats)
                        lng = sum(lngs) / len(lngs)
                    except (IndexError, TypeError):
                        pass
                
                features.append({
                    'type': 'Feature',
                    'geometry': geom,
                    'properties': {
                        'code': par_code,
                        'name': par_name,
                        'state_name': state_name,
                        'state': state_name,
                        'type': 'parlimen',
                        'lat': lat,
                        'lng': lng,
                    }
                })
            
            if features and not dry_run:
                poly_path = PUBLIC_GEOJSON / f"prn_{state_code.lower()}_parlimen_polygon.json"
                with open(poly_path, 'w') as f:
                    json.dump({'type': 'FeatureCollection', 'features': features}, f, ensure_ascii=False)
                print(f"    ✅ Saved {poly_path.name} ({len(features)} PARLIMEN)")
                
                # Centroid version
                center_features = []
                for feat in features:
                    p = dict(feat['properties'])
                    center_features.append({
                        'type': 'Feature',
                        'geometry': {'type': 'Point', 'coordinates': [p['lng'], p['lat']]},
                        'properties': p,
                    })
                cent_path = PUBLIC_GEOJSON / f"prn_{state_code.lower()}_parlimen.json"
                with open(cent_path, 'w') as f:
                    json.dump({'type': 'FeatureCollection', 'features': center_features}, f, ensure_ascii=False)
                print(f"    ✅ Saved {cent_path.name} ({len(center_features)} PARLIMEN centroids)")
            
            success = success or bool(features)
    
    return success


def main():
    parser = argparse.ArgumentParser(description='Download GeoJSON for all states')
    parser.add_argument('--state', help='Specific state to download')
    parser.add_argument('--dry-run', action='store_true', help='Show what would download')
    args = parser.parse_args()
    
    os.makedirs(PUBLIC_GEOJSON, exist_ok=True)
    os.makedirs(ELECTIONS_DIR, exist_ok=True)
    
    states_to_process = [args.state.lower()] if args.state else list(STATES.keys())
    
    for s in states_to_process:
        if s not in STATES:
            print(f"Unknown state: {s}. Options: {', '.join(STATES.keys())}")
            continue
        process_state(s, dry_run=args.dry_run)
    
    print(f"\n{'='*60}")
    print("SUMMARY")
    print(f"{'='*60}")
    print(f"GeoJSON files in {PUBLIC_GEOJSON}:")
    for f in sorted(PUBLIC_GEOJSON.glob('*.json')):
        print(f"  {f.name:45s} ({f.stat().st_size / 1024:.1f} KB)")
    
    print(f"\nElection Pack configs in {ELECTIONS_DIR}:")
    for conf in sorted(ELECTIONS_DIR.glob('*/config.json')):
        print(f"  {conf.relative_to(BASE)}")


if __name__ == '__main__':
    main()

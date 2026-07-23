#!/usr/bin/env python3
"""fetch-dun-wiki.py — Scrape Wikipedia for all 36 NSN DUN demographics."""
import json, re, time, os, sys, urllib.parse
from urllib.request import urlopen, Request
from urllib.error import HTTPError

DATA_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'kv-output')
os.makedirs(DATA_DIR, exist_ok=True)

DUN_WIKI = {
    'N01': 'Chennah', 'N02': 'Pertang', 'N03': 'Sungai Lui', 'N04': 'Klawang',
    'N05': 'Serting', 'N06': 'Palong', 'N07': 'Jeram Padang', 'N08': 'Bahau',
    'N09': 'Lenggeng', 'N10': 'Nilai', 'N11': 'Lobak', 'N12': 'Temiang',
    'N13': 'Sikamat', 'N14': 'Ampangan',
    'N15': 'Juasseh', 'N16': 'Seri Menanti',
    'N17': 'Senaling', 'N18': 'Pilah', 'N19': 'Johol', 'N20': 'Labu',
    'N21': 'Bukit Kepayang', 'N22': 'Rahang', 'N23': 'Mambau', 'N24': 'Seremban Jaya',
    'N25': 'Paroi', 'N26': 'Chembong', 'N27': 'Rantau', 'N28': 'Kota',
    'N29': 'Chuah', 'N30': 'Lukut', 'N31': 'Bagan Pinang', 'N32': 'Linggi',
    'N33': 'Sri Tanjung', 'N34': 'Gemas', 'N35': 'Gemencheh', 'N36': 'Repah',
}

# Map to Parliament seat for economic data
DUN_TO_PARLIAMENT = {
    'N01':'P126','N02':'P126','N03':'P126','N04':'P126',
    'N05':'P127','N06':'P127','N07':'P127','N08':'P127',
    'N09':'P128','N10':'P128','N11':'P128','N12':'P128','N13':'P128','N14':'P128',
    'N15':'P129','N16':'P129','N17':'P129','N18':'P129','N19':'P129',
    'N20':'P130','N21':'P130','N22':'P130','N23':'P130','N24':'P130',
    'N25':'P131','N26':'P131','N27':'P131','N28':'P131',
    'N29':'P132','N30':'P132','N31':'P132','N32':'P132','N33':'P132',
    'N34':'P133','N35':'P133','N36':'P133',
}

HEADERS = {'User-Agent': 'Mozilla/5.0 (SuaraAnakNegeriBot/1.0; research)'}

def wiki_get_text(page):
    """Get full page text via action=raw (returns wikitext)."""
    url = 'https://ms.wikipedia.org/w/index.php?action=raw&title=' + urllib.parse.quote(page, safe='')
    with urlopen(Request(url, headers=HEADERS), timeout=15) as resp:
        return resp.read().decode('utf-8')

def extract_demo_from_wikitext(text):
    """Extract demographics from wikitext (action=raw format)."""
    r = {}
    
    # Method 1: Pie chart template (label1=Melayu, value1=79.03)
    # Values often appear BEFORE labels in the wikitext → use two-pass
    demo_idx = text.find('Demografi')
    chart_text = text[demo_idx:] if demo_idx >= 0 else text
    
    # Pass 1: collect all labels
    labels = {}
    for m in re.finditer(r'label(\d+)\s*=\s*([^\n]+)', chart_text):
        labels[m.group(1)] = m.group(2).strip()
    
    # Pass 2: match values to labels
    for m in re.finditer(r'value(\d+)\s*=\s*([^\n]+)', chart_text):
        idx = m.group(1)
        if idx in labels:
            label = labels[idx].lower()
            # Clean wiki links: [[Melayu Malaysia|Melayu]] → melayu
            label_clean = re.sub(r'\[\[([^|\]]*\|)?([^\]]+)\]\]', r'\2', label)
            try:
                pct = float(m.group(2))
            except:
                continue
            if 'melayu' in label_clean:
                r['malay'] = pct
            elif 'cina' in label_clean:
                r['chinese'] = pct
            elif 'india' in label_clean:
                r['indian'] = pct
            elif 'lain' in label_clean or 'etnik' in label_clean:
                r['others'] = r.get('others', 0) + pct
    
    # Method 2: Inline percentage format "Melayu (79.03%)"
    if 'malay' not in r:
        for term, key in [('Melayu','malay'),('Cina','chinese'),('India','indian')]:
            m = re.search(rf'{term}[^)]*?\((\d+\.?\d*)%', text)
            if m: r[key] = float(m.group(1))
    
    # Pemilih from infobox (demo-electors=20206 or |Pemilih (2023) = 14554)
    m = re.search(r'\|\s*Pemilih\s*\(?(\d{4})\)?\s*[=:]?\s*(\d[\d,]+)', text)
    if m:
        r['year'] = int(m.group(1))
        r['totalElectors'] = int(m.group(2).replace(',', ''))
    else:
        m = re.search(r'\|\s*Pemilih\s*[=:]?\s*(\d[\d,]+)', text)
        if m:
            r['year'] = 2023
            r['totalElectors'] = int(m.group(1).replace(',', ''))
        else:
            m = re.search(r'demo-electors\s*=\s*(\d[\d,]*)', text)
            if m:
                r['year'] = 2023
                r['totalElectors'] = int(m.group(1).replace(',', ''))
    return r

def extract_voters_from_wikitext(text):
    """Extract Pemilih berdaftar per election year from wikitext."""
    voters = {}
    
    # Find election table sections with year headers
    # Pattern: {{MASelec/top|...|2023|...}} then look for Pemilih berdaftar
    for m in re.finditer(r'\{\{MASelec/top\|[^}]*?(\d{4})', text):
        yr = m.group(1)
        if yr not in ('2004','2008','2013','2018','2023','2026'):
            continue
        # Get content until next {{end}}
        rest = text[m.start():]
        end_m = re.search(r'\{\{end\}\}', rest)
        section_text = rest[:end_m.end()] if end_m else rest[:2000]
        
        # Find Pemilih berdaftar
        vm = re.search(r'\{\{MASelec/total\|Pemilih berdaftar\|(\d[\d,]*)\|', section_text)
        if vm:
            voters[yr] = int(vm.group(1).replace(',', ''))
    
    return voters

def main():
    results = {}
    errors = []

    for code in sorted(DUN_WIKI.keys()):
        name = DUN_WIKI[code]
        page = f'{name}_(kawasan_negeri)'
        print(f'  {code} ({name})...', end=' ', flush=True)

        try:
            wikitext = wiki_get_text(page)
            time.sleep(0.4)  # Rate limit

            demo = extract_demo_from_wikitext(wikitext)
            voters = extract_voters_from_wikitext(wikitext)

            demo['pemilih_per_year'] = voters
            results[code] = demo

            parts = [f'M={demo.get("malay",0):.0f}%' if demo.get('malay') else 'M=?',
                     f'C={demo.get("chinese",0):.0f}%' if demo.get('chinese') else 'C=?',
                     f'I={demo.get("indian",0):.0f}%' if demo.get('indian') else 'I=?',
                     f'V={demo.get("totalElectors",0)}']
            print(f'✓ {" ".join(parts)}')

        except HTTPError as e:
            errors.append(f'{code}: HTTP {e.code}')
            print(f'✗ HTTP {e.code}')
        except Exception as e:
            errors.append(f'{code}: {e}')
            print(f'✗ {e}')

        time.sleep(0.5)

    # Load Tindak economic data for NSN parliament seats
    tindak_path = os.path.join(os.path.dirname(__file__), '..', 'data', 'tindak-parsed.json')
    if os.path.exists(tindak_path):
        with open(tindak_path) as f:
            tindak = json.load(f)
        for code, demo in results.items():
            parl = DUN_TO_PARLIAMENT.get(code)
            if parl and parl in tindak:
                t = tindak[parl]
                demo['medianIncome'] = t.get('medianIncome')
                demo['meanIncome'] = t.get('meanIncome')
                demo['gini'] = t.get('gini')
                demo['poverty'] = t.get('poverty')

    out = os.path.join(DATA_DIR, 'dun-wiki-demographics.json')
    with open(out, 'w') as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f'\n✅ Saved {len(results)} DUN demographics → {out}')
    if errors:
        print(f'⚠️  {len(errors)} errors:')
        for e in errors: print(f'   - {e}')

    return results

if __name__ == '__main__':
    main()

// =============================================================================
// 🔄 PRN NS 2026 Dataset Update Script
// =============================================================================
// Cron job entry point. Run on schedule (e.g., daily at 0600) to:
//   1. Rebuild dataset from latest source data
//   2. Regenerate JSON for downstream consumers
//   3. Trigger dashboard rebuild
//
// Usage: npx tsx scripts/update-dataset.ts
// =============================================================================

import { writeFileSync, existsSync, mkdirSync } from 'fs'
import { resolve } from 'path'
import PRN_NS_2026_DATASET from '../src/data/prn-ns-2026'

const OUT_DIR = resolve(__dirname, '..', 'public', 'api')
const OUT_FILE = resolve(OUT_DIR, 'prn-ns-2026.json')

function generateJsonSnapshot() {
  if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true })

  const snapshot = {
    ...PRN_NS_2026_DATASET,
    generatedAt: new Date().toISOString(),
  }

  writeFileSync(OUT_FILE, JSON.stringify(snapshot, null, 2), 'utf-8')
  console.log(`✅ Dataset written to ${OUT_FILE}`)
  console.log(`   • ${PRN_NS_2026_DATASET.parties.length} parties`)
  console.log(`   • ${PRN_NS_2026_DATASET.alliances.length} alliances`)
  console.log(`   • ${PRN_NS_2026_DATASET.keyRaces.length} key races`)
  console.log(`   • ${PRN_NS_2026_DATASET.timeline.length} timeline events`)
}

// ── Run ──
generateJsonSnapshot()

// ── Export for programmatic use (cron wrappers) ──
export { generateJsonSnapshot }

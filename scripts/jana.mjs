/**
 * Trigger import berita AI melalui /api/jana-berita.
 *
 * Gunaan:
 *   npm run jana                  # POST ke dev server (http://localhost:3000)
 *   node scripts/jana.mjs --url http://localhost:3000   # tetapkan base URL
 *
 * Prasyarat:
 *   - Dev server `npm run dev` sedang berjalan (atau tentukan --url)
 *   - .env.local mempunyai SANITY_API_WRITE_TOKEN & DEEPSEEK_API_KEY
 */
import {readFile} from 'node:fs/promises'
import {existsSync} from 'node:fs'
import {resolve, dirname} from 'node:path'
import {fileURLToPath} from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

// --- Parse argumen CLI ---
const args = process.argv.slice(2)
const urlArg = args.findIndex((a) => a === '--url')
const BASE_URL =
	urlArg !== -1 && args[urlArg + 1] ? args[urlArg + 1] : process.env.JANA_URL || 'http://localhost:3000'

// --- Muat .env.local secara manual (Node tak auto-load) ---
async function loadEnvLocal() {
	const envPath = resolve(ROOT, '.env.local')
	if (!existsSync(envPath)) {
		console.warn('⚠️  .env.local tidak dijumpai — pastikan env var sudah di-export di shell.')
		return
	}
	const raw = await readFile(envPath, 'utf8')
	for (const line of raw.split('\n')) {
		const trimmed = line.trim()
		if (!trimmed || trimmed.startsWith('#')) continue
		const eq = trimmed.indexOf('=')
		if (eq === -1) continue
		const key = trimmed.slice(0, eq).trim()
		let val = trimmed.slice(eq + 1).trim()
		if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
			val = val.slice(1, -1)
		}
		if (!(key in process.env)) process.env[key] = val
	}
}

async function main() {
	await loadEnvLocal()

	const endpoint = `${BASE_URL.replace(/\/+$/, '')}/api/jana-berita`
	console.log(`\n🚀 [Jana] Trigger: POST ${endpoint}\n`)

	// Semak prasyarat env yang kritikal
	const missing = []
	if (!process.env.SANITY_API_WRITE_TOKEN && !process.env.SANITY_API_READ_TOKEN) {
		missing.push('SANITY_API_WRITE_TOKEN')
	}
	if (!process.env.DEEPSEEK_API_KEY) missing.push('DEEPSEEK_API_KEY')
	if (missing.length) {
		console.error(`❌ Env var hilang: ${missing.join(', ')}`)
		console.error('   Pastikan ia wujud dalam .env.local atau shell env.')
		process.exit(1)
	}

	const started = Date.now()
	let res
	try {
		res = await fetch(endpoint, {method: 'POST'})
	} catch (err) {
		const msg = err instanceof Error ? err.message : String(err)
		console.error(`\n❌ Gagal hubungi dev server di ${endpoint}.`)
		console.error(`   Punca: ${msg}`)
		console.error(`   Pastikan "npm run dev" sedang berjalan, atau guna --url <base>.`)
		process.exit(1)
	}

	const text = await res.text()
	let json
	try {
		json = JSON.parse(text)
	} catch {
		json = {raw: text}
	}

	const elapsed = ((Date.now() - started) / 1000).toFixed(1)

	if (!res.ok) {
		console.error(`\n❌ HTTP ${res.status} (dalam ${elapsed}s)`)
		console.error(JSON.stringify(json, null, 2))
		process.exit(1)
	}

	// Ringkasan kejayaan
	const created = json.created ?? 0
	const failed = json.failed ?? 0
	const total = json.total ?? 0
	const target = json.target ?? '?'

	console.log(`\n✅ [Jana] Selesai dalam ${elapsed}s`)
	console.log(`   Sasaran : ${target}`)
	console.log(`   Dicipta : ${created}`)
	console.log(`   Gagal   : ${failed}`)
	console.log(`   Jumlah  : ${total}`)

	if (Array.isArray(json.results) && json.results.length) {
		console.log('\n📋 Butiran:')
		for (const r of json.results) {
			const icon = r.status === 'created' ? '🆕' : '⚠️'
			console.log(`   ${icon} [${r.source}] ${r.title.slice(0, 70)}${r.error ? ` — ${r.error}` : ''}`)
		}
	}

	if (created < target) {
		console.warn(
			`\n⚠️  Hanya ${created}/${target} berjaya. Sebab biasa: kolam RSS selepas dedup kurang dari sasaran, atau ada feed yang gagal.`
		)
	}
}

main().catch((e) => {
	console.error('❌', e instanceof Error ? e.message : e)
	process.exit(1)
})

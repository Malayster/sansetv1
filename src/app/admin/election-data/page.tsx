'use client'

import { useState, useEffect, useCallback } from 'react'

type Candidate = {
  name: string
  party: string
  role: 'penyandang' | 'pencabar'
  profile?: string
  wikipediaUrl?: string
  votes?: number
  percentage?: number
  result?: 'won' | 'lost'
}

type Region = {
  code: string
  name: string
  state: string
  parCode: string
  parName: string
  candidates: Candidate[]
  demographics: any
  history: any
  lat: number
  lng: number
}

type StateInfo = {
  key: string
  name: string
  electionId: string
  state: string
  stateShort: string
  dunCount: number
  parCount: number
}

export default function ElectionDataAdmin() {
  const [states, setStates] = useState<StateInfo[]>([])
  const [selectedState, setSelectedState] = useState<string>('')
  const [regions, setRegions] = useState<Region[]>([])
  const [selectedRegion, setSelectedRegion] = useState<Region | null>(null)
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null)
  const [kvStatus, setKvStatus] = useState<{ enabled: boolean; namespaces: any } | null>(null)
  const [syncOpen, setSyncOpen] = useState(false)
  const [syncRunning, setSyncRunning] = useState(false)
  const [syncLog, setSyncLog] = useState('')
  const [syncOpts, setSyncOpts] = useState({ state: '', type: '', seats: '', noBallots: false })

  // Load list of states
  useEffect(() => { fetchStates() }, [])

  async function fetchStates() {
    setLoading(true)
    setError('')
    try {
      const res = await fetch('/api/admin/election')
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setStates(json.states || [])
      setKvStatus(json.kv || null)
    } catch (e: any) {
      setError(e.message || 'Gagal memuat senarai negeri')
    } finally {
      setLoading(false)
    }
  }

  async function fetchRegions(stateKey: string) {
    setLoading(true)
    setError('')
    setSelectedRegion(null)
    try {
      const res = await fetch(`/api/admin/election?state=${stateKey}`)
      const json = await res.json()
      if (json.error) throw new Error(json.error)
      setRegions(json.regions || [])
    } catch (e: any) {
      setError(e.message || 'Gagal memuat data DUN')
    } finally {
      setLoading(false)
    }
  }

  function notify(type: 'success' | 'error', msg: string) {
    setNotification({ type, msg })
    setTimeout(() => setNotification(null), 5000)
  }

  async function saveRegion(updated: Region) {
    setSaving(true)
    setError('')
    try {
      const body: any = { code: updated.code }

      // Detect candidates changes (not part of election result)
      if (updated.candidates) {
        body.candidates = updated.candidates
      }

      const res = await fetch('/api/admin/election', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const json = await res.json()
      if (!res.ok) {
        if (json.details) {
          const msgs = json.details.map((d: any) => d.message).join('\n')
          throw new Error(msgs)
        }
        throw new Error(json.error || 'Unknown error')
      }
      
      // Update state
      setRegions(rs => rs.map(r => r.code === updated.code ? updated : r))

      notify('success', `✅ ${updated.code} (${updated.name}) disimpan`)
      // Refresh the selected region view
      setSelectedRegion(updated)
    } catch (e: any) {
      notify('error', `❌ ${e.message}`)
    } finally {
      setSaving(false)
    }
  }

  // ─── Sync from ElectionData.MY ────────────────────────
  async function startSync() {
    try {
      const opts: any = {}
      if (syncOpts.state)      opts.state = syncOpts.state
      if (syncOpts.type)       opts.type = syncOpts.type
      if (syncOpts.seats)      opts.seats = parseInt(syncOpts.seats, 10)
      if (syncOpts.noBallots)  opts.noBallots = true

      const res = await fetch('/api/admin/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(opts),
      })
      const json = await res.json()
      if (!res.ok) throw new Error(json.error || 'Sync failed')
      notify('success', `🔄 Sync bermula (PID ${json.pid})`)
      setSyncRunning(true)
      pollSync()
    } catch (e: any) {
      notify('error', `Sync gagal: ${e.message}`)
    }
  }

  async function pollSync() {
    try {
      const res = await fetch('/api/admin/sync')
      const json = await res.json()
      setSyncLog(json.tail || '')
      if (json.running) {
        setTimeout(pollSync, 3000)
      } else {
        setSyncRunning(false)
        if (selectedState) fetchRegions(selectedState)
        notify('success', '✅ Sync selesai. Muat semula data kawasan.')
      }
    } catch {
      setTimeout(pollSync, 5000)
    }
  }

  const filteredRegions = regions.filter(r =>
    !search ||
    r.code.toLowerCase().includes(search.toLowerCase()) ||
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.parName.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-hitam text-putih">
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-putih">🗳️ Admin Data Pilihan Raya</h1>
            <p className="text-putih/40 text-sm mt-1">Tambah / edit calon, undi & demografi untuk semua negeri</p>
          </div>
          <div className="flex items-center gap-3">
            {kvStatus && (
              <span className={`text-xs px-2.5 py-1 rounded-full border ${kvStatus.enabled
                ? 'bg-green-500/15 border-green-500/30 text-green-400'
                : 'bg-putih/5 border-putih/20 text-putih/50'}`}
                  title={kvStatus.enabled ? 'Cloudflare KV aktif — write-through enabled' : 'Local mode: JSON static only'}>
                {kvStatus.enabled ? '☁️ KV Aktif' : '💾 Local JSON'}
              </span>
            )}
            <button
              onClick={() => { setSyncOpen(true); pollSync() }}
              className="text-xs px-3 py-1.5 bg-kuning/10 hover:bg-kuning/20 border border-kuning/30 text-kuning rounded-lg transition flex items-center gap-1.5"
              title="Sync data dari ElectionData.MY API"
            >
              🔄 Sync ElectionData.MY
            </button>
            <a href="/admin" className="text-putih/60 hover:text-merah text-sm transition">← Sanity Studio</a>
          </div>
        </div>

        {/* Sync Modal */}
        {syncOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-hitam border border-kuning/30 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-putih">🔄 Sync ElectionData.MY</h2>
                <button onClick={() => setSyncOpen(false)} className="text-putih/60 hover:text-merah text-xl">✕</button>
              </div>
              <p className="text-putih/50 text-xs mb-4">
                Pull data terkini dari api.electiondata.my/v1 ke local JSON. Key disimpan server-side.
              </p>

              <div className="grid grid-cols-2 gap-3 mb-4">
                <label className="text-xs text-putih/60">
                  Negeri (opsyenal)
                  <input type="text" placeholder="Selangor" value={syncOpts.state}
                    onChange={e => setSyncOpts({ ...syncOpts, state: e.target.value })}
                    className="mt-1 w-full bg-putih/5 border border-putih/15 rounded px-2 py-1.5 text-putih text-sm" />
                </label>
                <label className="text-xs text-putih/60">
                  Jenis
                  <select value={syncOpts.type}
                    onChange={e => setSyncOpts({ ...syncOpts, type: e.target.value })}
                    className="mt-1 w-full bg-putih/5 border border-putih/15 rounded px-2 py-1.5 text-putih text-sm">
                    <option value="">Semua</option>
                    <option value="parlimen">Parlimen sahaja</option>
                    <option value="dun">DUN sahaja</option>
                  </select>
                </label>
                <label className="text-xs text-putih/60">
                  Limit kerusi (untuk test)
                  <input type="number" placeholder="— " value={syncOpts.seats}
                    onChange={e => setSyncOpts({ ...syncOpts, seats: e.target.value })}
                    className="mt-1 w-full bg-putih/5 border border-putih/15 rounded px-2 py-1.5 text-putih text-sm" />
                </label>
                <label className="text-xs text-putih/60 flex items-center gap-2 mt-5">
                  <input type="checkbox" checked={syncOpts.noBallots}
                    onChange={e => setSyncOpts({ ...syncOpts, noBallots: e.target.checked })} />
                  Skip ballots (cepat — winner sahaja)
                </label>
              </div>

              <div className="flex gap-2 mb-4">
                <button onClick={startSync} disabled={syncRunning}
                  className="px-4 py-2 bg-kuning text-hitam font-bold rounded-lg disabled:opacity-50 hover:bg-kuning/80">
                  {syncRunning ? '⏳ Berjalan...' : '▶ Mula Sync'}
                </button>
                <a href="/api/admin/sync" target="_blank"
                  className="px-4 py-2 bg-putih/5 hover:bg-putih/10 text-putih rounded-lg text-sm">
                  📄 Lihat log
                </a>
              </div>

              {syncLog && (
                <div>
                  <p className="text-xs text-putih/50 mb-1">Log (60 baris terakhir):</p>
                  <pre className="bg-hitam border border-putih/10 rounded-lg p-3 text-xs text-putih/70 max-h-72 overflow-y-auto whitespace-pre-wrap font-mono">
{syncLog}
                  </pre>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div className={`mb-4 p-4 rounded-lg border ${notification.type === 'success'
            ? 'bg-green-500/10 border-green-500/30 text-green-400'
            : 'bg-merah/10 border-merah/30 text-merah'
          }`}>
            {notification.msg}
          </div>
        )}

        {loading && (
          <div className="text-putih/60 text-center py-8">⏳ Memuat data...</div>
        )}

        {error && !loading && (
          <div className="bg-merah/10 border border-merah/30 text-merah p-4 rounded-lg mb-4">⚠️ {error}</div>
        )}

        {/* Step 1: Pick state */}
        {states.length > 0 && !selectedState && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {states.map(s => (
              <button
                key={s.key}
                onClick={() => { setSelectedState(s.key); fetchRegions(s.key) }}
                className="bg-putih/5 hover:bg-putih/10 border border-putih/10 hover:border-merah/30 transition rounded-xl p-5 text-left cursor-pointer"
              >
                <div className="flex items-center justify-between mb-1">
                  <h3 className="font-bold text-putih text-lg">{s.state || s.key}</h3>
                  {s.stateShort && (
                    <span className="text-xs bg-kuning/15 text-kuning px-2 py-0.5 rounded">{s.stateShort}</span>
                  )}
                </div>
                <p className="text-putih/40 text-sm mb-3">{s.name}</p>
                <div className="flex gap-4 text-xs">
                  <span className="text-putih/60">{s.dunCount} DUN</span>
                  <span className="text-putih/60">{s.parCount} PAR</span>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Step 2: List regions / edit */}
        {selectedState && (
          <>
            <div className="flex items-center justify-between mb-4">
              <button
                onClick={() => { setSelectedState(''); setRegions([]); setSelectedRegion(null) }}
                className="text-putih/60 hover:text-merah text-sm transition"
              >
                ← Semua Negeri
              </button>
              <div className="flex items-center gap-3">
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Cari DUN..."
                  className="bg-putih/5 border border-putih/10 rounded-lg px-3 py-1.5 text-sm text-putih placeholder-putih/30 focus:outline-none focus:border-merah/40 w-48"
                />
                <span className="text-putih/40 text-sm">{filteredRegions.length} / {regions.length}</span>
              </div>
            </div>

            {filteredRegions.length > 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Region list (left) */}
                <div className="lg:col-span-4 space-y-2 max-h-[80vh] overflow-y-auto">
                  {filteredRegions.map(r => {
                    const isSelected = selectedRegion?.code === r.code
                    const hasData = r.candidates?.length > 0 || r.history
                    return (
                      <button
                        key={r.code}
                        onClick={() => setSelectedRegion(r)}
                        className={`w-full text-left p-3 rounded-lg border transition cursor-pointer ${
                          isSelected
                            ? 'bg-merah/15 border-merah/40'
                            : 'bg-putih/5 border-putih/10 hover:bg-putih/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="font-mono text-xs text-kuning shrink-0">{r.code}</span>
                            <span className="text-sm text-putih truncate">{r.name}</span>
                          </div>
                          <div className="flex items-center gap-2 shrink-0 text-xs">
                            {hasData && <span className="text-green-400" title="Ada data">●</span>}
                            {r.candidates?.length > 0 && (
                              <span className="text-putih/40">{r.candidates.length}c</span>
                            )}
                          </div>
                        </div>
                        {r.parName && (
                          <p className="text-xs text-putih/30 mt-1 truncate">{r.parCode} {r.parName}</p>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Editor (right) */}
                <div className="lg:col-span-8">
                  {selectedRegion ? (
                    <RegionEditor
                      key={selectedRegion.code}
                      region={selectedRegion}
                      onChange={(updated) => setSelectedRegion(updated)}
                      onSave={saveRegion}
                      saving={saving}
                    />
                  ) : (
                    <div className="bg-putih/5 border border-putih/10 rounded-xl p-12 text-center">
                      <p className="text-putih/40 text-lg">← Pilih DUN untuk mula edit</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

// ─── Region Editor Component ────────────────────────
function RegionEditor({
  region,
  onChange,
  onSave,
  saving,
}: {
  region: Region
  onChange: (updated: Region) => void
  onSave: (updated: Region) => void
  saving: boolean
}) {
  const [editingCandidates, setEditingCandidates] = useState(false)

  function updateCandidates(updated: Candidate[]) {
    onChange({ ...region, candidates: updated })
  }

  return (
    <div className="bg-putih/5 border border-putih/10 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="border-b border-putih/10 pb-4">
        <div className="flex items-center gap-3 mb-1">
          <span className="font-mono text-xs bg-kuning/15 text-kuning px-2 py-0.5 rounded">{region.code}</span>
          <h2 className="text-2xl font-bold text-putih">{region.name}</h2>
        </div>
        <p className="text-putih/40 text-sm">
          {region.state} • {region.parCode} {region.parName}
        </p>
      </div>

      {/* Candidates section */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-putih">👥 Calon ({region.candidates?.length || 0})</h3>
          <div className="flex gap-2">
            <button
              onClick={() => setEditingCandidates(!editingCandidates)}
              className="text-xs px-3 py-1.5 bg-putih/5 hover:bg-putih/10 text-putih rounded transition"
            >
              {editingCandidates ? '✓ Selesai' : '✎ Edit'}
            </button>
          </div>
        </div>

        {editingCandidates ? (
          <CandidateEditor
            candidates={region.candidates || []}
            onChange={updateCandidates}
          />
        ) : (
          <div className="space-y-2">
            {region.candidates?.length > 0 ? (
              region.candidates.map((c, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-putih/5 rounded-lg">
                  <span className={`text-xs px-2 py-0.5 rounded ${c.role === 'penyandang' ? 'bg-kuning/20 text-kuning' : 'bg-putih/10 text-putih/60'}`}>
                    {c.role === 'penyandang' ? '👑' : '🆕'} {c.role || 'pencabar'}
                  </span>
                  <span className="font-medium text-putih flex-1">{c.name}</span>
                  <span className="text-merah font-mono text-xs">{c.party}</span>
                </div>
              ))
            ) : (
              <p className="text-putih/30 text-sm text-center py-6">Tiada calon ditambah. Klik "Edit" untuk mula.</p>
            )}
          </div>
        )}
      </div>

      {/* History section */}
      {region.history && (
        <div>
          <h3 className="text-lg font-bold text-putih mb-3">📜 Sejarah Pilihan Raya</h3>
          <div className="space-y-2">
            {region.history.elections?.slice(-3).map((e: any, i: number) => (
              <div key={i} className="p-3 bg-putih/5 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-putih">{e.electionName || e.year}</span>
                  <span className="text-xs text-putih/40">Majoriti: {e.majority?.toLocaleString() ?? '—'}</span>
                </div>
                {e.candidates?.map((c: any, j: number) => (
                  <div key={j} className="flex items-center gap-2 text-xs py-0.5">
                    <span className={`px-1.5 py-0.5 rounded ${c.result === 'won' ? 'bg-green-500/15 text-green-400' : 'text-putih/50'}`}>
                      {c.result === 'won' ? '🏆' : ''} {c.party}
                    </span>
                    <span className="text-putih/70 flex-1 truncate">{c.name}</span>
                    <span className="text-putih/40">{c.votes?.toLocaleString() ?? '—'} undi</span>
                    <span className="text-kuning">{c.percentage}%</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save button */}
      <div className="flex items-center gap-3 pt-4 border-t border-putih/10">
        <button
          onClick={() => onSave(region)}
          disabled={saving}
          className="px-5 py-2 bg-merah hover:bg-merah/80 text-putih font-bold rounded-lg transition disabled:opacity-50"
        >
          {saving ? '⏳ Menyimpan...' : '💾 Simpan'}
        </button>
        <p className="text-putih/40 text-xs">
          Data akan disimpan ke JSON static. Validation dipakai sebelum simpan.
        </p>
      </div>
    </div>
  )
}

// ─── Candidate Editor Component ─────────────────────
function CandidateEditor({
  candidates,
  onChange,
}: {
  candidates: Candidate[]
  onChange: (updated: Candidate[]) => void
}) {
  const PARTIES = ['BN', 'PH', 'PN', 'GPS', 'GRS', 'WARISAN', 'MUDA', 'PBM', 'PEJUANG', 'BEBAS']

  function addCandidate() {
    onChange([...candidates, { name: '', party: 'PH', role: 'pencabar' }])
  }

  function removeCandidate(idx: number) {
    onChange(candidates.filter((_, i) => i !== idx))
  }

  function updateCandidate(idx: number, field: keyof Candidate, value: any) {
    const updated = [...candidates]
    updated[idx] = { ...updated[idx], [field]: value }
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      {candidates.map((c, i) => (
        <div key={i} className="p-3 bg-putih/5 rounded-lg space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-putih/30 text-xs w-5 shrink-0">#{i + 1}</span>
            <input
              type="text"
              value={c.name || ''}
              onChange={(e) => updateCandidate(i, 'name', e.target.value)}
              placeholder="Nama calon..."
              className="flex-1 bg-putih/5 border border-putih/10 rounded px-2 py-1.5 text-sm text-putih placeholder-putih/30 focus:outline-none focus:border-merah/40"
            />
            <button
              onClick={() => removeCandidate(i)}
              className="text-merah hover:bg-merah/15 px-2 py-1.5 text-xs rounded transition shrink-0"
            >
              ✕
            </button>
          </div>
          <div className="flex items-center gap-2 ml-7">
            <select
              value={c.party || 'PH'}
              onChange={(e) => updateCandidate(i, 'party', e.target.value)}
              className="bg-putih/5 border border-putih/10 rounded px-2 py-1.5 text-sm text-putih focus:outline-none focus:border-merah/40"
            >
              {PARTIES.map(p => <option key={p} value={p} className="bg-hitam">{p}</option>)}
            </select>
            <select
              value={c.role || 'pencabar'}
              onChange={(e) => updateCandidate(i, 'role', e.target.value as any)}
              className="bg-putih/5 border border-putih/10 rounded px-2 py-1.5 text-sm text-putih focus:outline-none focus:border-merah/40"
            >
              <option value="pencabar" className="bg-hitam">🆕 Pencabar</option>
              <option value="penyandang" className="bg-hitam">👑 Penyandang</option>
            </select>
            <input
              type="url"
              value={c.wikipediaUrl || ''}
              onChange={(e) => updateCandidate(i, 'wikipediaUrl', e.target.value)}
              placeholder="Wiki URL (optional)"
              className="flex-1 bg-putih/5 border border-putih/10 rounded px-2 py-1.5 text-sm text-putih placeholder-putih/30 focus:outline-none focus:border-merah/40"
            />
          </div>
        </div>
      ))}
      <button
        onClick={addCandidate}
        className="w-full py-2.5 border border-dashed border-putih/20 hover:border-merah/40 hover:bg-merah/5 text-putih/60 hover:text-putih text-sm rounded-lg transition"
      >
        ➕ Tambah Calon
      </button>

      <p className="text-putih/30 text-xs">
        💡 Validation akan semak: nama & parti diperlukan, tak boleh ada parti duplikat.
      </p>
    </div>
  )
}
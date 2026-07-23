import { NextRequest, NextResponse } from 'next/server'
import child_process from 'child_process'
import path from 'path'
import fs from 'fs'

const API_KEY_ENV = process.env.ELECTIONDATA_API_KEY || ''
const ROOT = process.cwd()

/**
 * POST /api/admin/sync
 * Triggers scripts/sync-electiondata.mjs as a detached background process.
 *
 * Body:  { state?: string, type?: 'parlimen'|'dun', seats?: number, noBallots?: boolean }
 *
 * Security: only callable from server-side admin UI (same origin). The
 * ELECTIONDATA_API_KEY stays server-side — never sent to the client.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any))
    const { state, type, seats, noBallots } = body as {
      state?: string
      type?: 'parlimen' | 'dun'
      seats?: number
      noBallots?: boolean
    }

    if (!API_KEY_ENV) {
      return NextResponse.json(
        { error: 'ELECTIONDATA_API_KEY env var not set on server.' },
        { status: 500 }
      )
    }

    if (state && !/^[A-Za-z .]+$/.test(state)) {
      return NextResponse.json({ error: 'Invalid state' }, { status: 422 })
    }
    if (type && !['parlimen', 'dun'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 422 })
    }
    if (seats != null && (!Number.isInteger(seats) || seats < 1 || seats > 1000)) {
      return NextResponse.json({ error: 'seats must be 1-1000' }, { status: 422 })
    }

    const scriptAbs = path.join(ROOT, 'scripts', 'sync-electiondata.mjs')
    if (!fs.existsSync(scriptAbs)) {
      return NextResponse.json({ error: 'Sync script not found' }, { status: 500 })
    }

    const args = ['sync-electiondata.mjs']
    if (state)     args.push('--state', state)
    if (type)      args.push('--type', type)
    if (seats)     args.push('--seats', String(seats))
    if (noBallots) args.push('--no-ballots')

    const logFile = path.join(ROOT, 'data', 'kv-output', 'sync-log.txt')
    fs.mkdirSync(path.dirname(logFile), { recursive: true })
    const logFd = fs.openSync(logFile, 'w')

    const child = child_process.spawn('node', args, {
      cwd: path.join(ROOT, 'scripts'),
      env: { ...process.env, ELECTIONDATA_API_KEY: API_KEY_ENV },
      detached: true,
      stdio: ['ignore', logFd, logFd],
    })
    child.unref()
    fs.closeSync(logFd)

    return NextResponse.json({
      ok: true,
      message: 'Sync started in background.',
      pid: child.pid,
      log: path.relative(ROOT, logFile),
      args,
    })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}

/**
 * GET /api/admin/sync
 * Returns tail of the sync log + whether sync is still running.
 */
export async function GET() {
  try {
    const logFile = path.join(ROOT, 'data', 'kv-output', 'sync-log.txt')
    if (!fs.existsSync(logFile)) {
      return NextResponse.json({ ok: true, running: false, tail: '' })
    }
    const content = fs.readFileSync(logFile, 'utf8')
    const lines = content.split('\n')
    const tail = lines.slice(-60).join('\n')
    const running = /Step 2:/.test(content) && !/Sync complete/.test(content.slice(-800))
    return NextResponse.json({ ok: true, running, tail })
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'Internal error' }, { status: 500 })
  }
}
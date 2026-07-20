'use client'

import { useState } from 'react'

export default function NewsletterForm({ source = 'footer' }: { source?: string }) {
	const [email, setEmail] = useState('')
	const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
	const [message, setMessage] = useState('')

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (status === 'loading') return

		setStatus('loading')
		setMessage('')

		try {
			const res = await fetch('/api/subscribe', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ email, source }),
			})
			const data = await res.json()

			if (res.ok) {
				setStatus('success')
				setMessage(data.message || 'Berjaya!')
				setEmail('')
			} else {
				setStatus('error')
				setMessage(data.error || 'Gagal')
			}
		} catch {
			setStatus('error')
			setMessage('Ralat sambungan. Sila cuba lagi.')
		}
	}

	return (
		<form onSubmit={handleSubmit} className="flex flex-col gap-2">
			<div className="flex gap-2">
				<input
					type="email"
					value={email}
					onChange={(e) => setEmail(e.target.value)}
					placeholder="emel@contoh.com"
					required
					disabled={status === 'loading'}
					className="flex-1 rounded-md border border-putih/20 bg-putih/10 px-3 py-2 text-sm text-putih placeholder:text-putih/40 outline-none focus:border-merah transition disabled:opacity-50"
				/>
				<button
					type="submit"
					disabled={status === 'loading'}
					className="rounded-md bg-merah px-4 py-2 text-sm font-bold text-putih hover:bg-merah-gelap transition disabled:opacity-50"
				>
					{status === 'loading' ? '...' : 'Langgan'}
				</button>
			</div>
			{message && (
				<p
					className={`text-xs ${
						status === 'success' ? 'text-green-400' : 'text-red-400'
					}`}
				>
					{message}
				</p>
			)}
		</form>
	)
}

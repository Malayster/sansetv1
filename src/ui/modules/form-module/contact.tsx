'use client'

import { useState } from 'react'
import type { Form } from '@/sanity/types'

export default function ({ form }: { form: Form }) {
	const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
	const [msg, setMsg] = useState('')

	const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault()
		if (state === 'loading') return

		setState('loading')
		const formData = new FormData(e.currentTarget)
		const body = {
			name: formData.get('name'),
			email: formData.get('email'),
			message: formData.get('message'),
			formId: form.identifier,
		}

		try {
			const res = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(body),
			})
			const data = await res.json()
			if (res.ok) {
				setState('success')
				setMsg(data.message || 'Berjaya!')
				e.currentTarget.reset()
			} else {
				setState('error')
				setMsg(data.error || 'Ralat')
			}
		} catch {
			setState('error')
			setMsg('Ralat sambungan. Sila cuba lagi.')
		}
	}

	return (
		<form className="gap-ch grid" onSubmit={handleSubmit}>
			<label>
				<span>Nama</span>
				<input
					className="input w-full"
					name="name"
					type="text"
					autoComplete="name"
					placeholder="Ahmad Ali"
					required
					disabled={state === 'loading'}
				/>
			</label>

			<label>
				<span>Emel</span>
				<input
					className="input w-full"
					name="email"
					type="email"
					autoComplete="email"
					placeholder="ahmad@contoh.com"
					required
					disabled={state === 'loading'}
				/>
			</label>

			<label>
				<span>Mesej</span>
				<textarea
					className="input w-full"
					name="message"
					placeholder="Tulis mesej anda..."
					rows={4}
					required
					disabled={state === 'loading'}
				/>
			</label>

			{msg && (
				<p
					className={`text-sm ${
						state === 'success' ? 'text-green-600' : 'text-red-600'
					}`}
				>
					{msg}
				</p>
			)}

			<div>
				<button
					className="action max-sm:w-full"
					type="submit"
					disabled={state === 'loading'}
				>
					{state === 'loading' ? 'Menghantar...' : 'Hantar'}
				</button>
			</div>
		</form>
	)
}

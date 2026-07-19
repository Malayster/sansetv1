'use client'

import { useState } from 'react'
import { Card, Stack, Text, Button, Spinner, Box } from '@sanity/ui'

export default function JanaBeritaTool() {
	const [loading, setLoading] = useState(false)
	const [result, setResult] = useState<{ created: number; failed: number } | null>(null)
	const [error, setError] = useState('')

	const handleJana = async () => {
		setLoading(true)
		setError('')
		setResult(null)
		try {
			const res = await fetch('/api/jana-berita', { method: 'POST' })
			const json = await res.json()
			if (!res.ok) throw new Error(json.error || 'Gagal menjana')
			setResult(json)
		} catch (e: any) {
			setError(e.message || 'Ralat')
		} finally {
			setLoading(false)
		}
	}

	return (
		<Box padding={4}>
			<Stack space={4}>
				<Card padding={4} radius={2} shadow={1}>
					<Stack space={4}>
						<Text size={3} weight="bold">🤖 Jana Berita AI</Text>
						<Text size={1} muted>
							Sedut berita terkini dari Bernama, Malaysiakini, Utusan &amp; Berita Harian.
							AI akan menulis semula dalam Bahasa Malaysia dan menyimpan sebagai draf.
						</Text>
						<Button
							tone="positive"
							text={loading ? 'Menjana...' : '🔍 Cari Berita Terkini'}
							disabled={loading}
							onClick={handleJana}
						/>
						{loading && <Spinner />}
						{error && <Text size={1} tone="critical">⚠️ {error}</Text>}
						{result && (
							<Text size={2}>
								✅ {result.created} artikel berjaya, {result.failed} gagal.
							</Text>
						)}
					</Stack>
				</Card>
			</Stack>
		</Box>
	)
}

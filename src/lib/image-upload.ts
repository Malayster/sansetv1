import { createClient } from '@sanity/client'
import { apiVersion, dataset, projectId } from '@/sanity/env'

/**
 * Fetch royalty-free image from LoremFlickr based on keywords.
 * Falls back to Picsum if LoremFlickr fails.
 */
async function downloadImage(keywords: string): Promise<ArrayBuffer> {
	const urls = [
		`https://loremflickr.com/800/600/${encodeURIComponent(keywords.replace(/\s+/g, ','))}`,
		`https://loremflickr.com/800/600/${encodeURIComponent(keywords.split(' ')[0])}`,
	]

	for (const url of urls) {
		try {
			const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
			if (res.ok) {
				const buf = await res.arrayBuffer()
				if (buf.byteLength > 1000) return buf
			}
		} catch {
			continue
		}
	}

	// Fallback: Picsum random
	const res = await fetch('https://picsum.photos/800/600', { signal: AbortSignal.timeout(5000) })
	return res.arrayBuffer()
}

/**
 * Upload image to Sanity and return the asset reference
 */
export async function uploadImageToSanity(
	imageKeywords: string,
	token: string,
): Promise<{ _type: 'image'; asset: { _type: 'reference'; _ref: string } } | null> {
	try {
		const buffer = await downloadImage(imageKeywords)

		const client = createClient({
			projectId,
			dataset,
			apiVersion,
			useCdn: false,
			token,
		})

		const asset = await client.assets.upload('image', Buffer.from(buffer), {
			filename: `${imageKeywords.replace(/\s+/g, '-').slice(0, 60)}.jpg`,
			contentType: 'image/jpeg',
		})

		return {
			_type: 'image',
			asset: {
				_type: 'reference',
				_ref: asset._id,
			},
		}
	} catch (e) {
		console.warn('[Imej] Gagal muat naik:', e instanceof Error ? e.message : e)
		return null
	}
}

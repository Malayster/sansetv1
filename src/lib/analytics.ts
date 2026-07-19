import { client } from '@/sanity/lib/client'
import { groq } from 'next-sanity'

export type DailyStats = {
	_id: string
	date: string
	totalViews: number
	uniqueSessions: number
	searchQueries: { query: string; count: number }[]
	articleViews: { slug: string; title: string; views: number }[]
	categoryViews: { category: string; views: number }[]
	countries: { country: string; count: number }[]
	devices: { device: string; count: number }[]
}

const TODAY_ID = () => `analytics.${new Date().toISOString().split('T')[0]}`

export async function trackPageView(
	slug: string,
	title: string,
	categories: string[],
	referrer?: string,
	country?: string,
	device?: string,
) {
	try {
		const today = TODAY_ID()
		const existing = await client.fetch<DailyStats | null>(
			groq`*[_id == $id][0]`,
			{ id: today },
		)

		if (existing) {
			const patch = client.patch(today)
			patch.inc({ totalViews: 1 })

			// Track article view
			const articleIdx = existing.articleViews?.findIndex((a) => a.slug === slug)
			if (articleIdx >= 0) {
				patch.inc({ [`articleViews[${articleIdx}].views`]: 1 })
			} else {
				patch.insert('after', 'articleViews[-1]', [{ slug, title, views: 1 }])
			}

			// Track category views
			for (const cat of categories) {
				const catIdx = existing.categoryViews?.findIndex((c) => c.category === cat)
				if (catIdx >= 0) {
					patch.inc({ [`categoryViews[${catIdx}].views`]: 1 })
				} else {
					patch.insert('after', 'categoryViews[-1]', [{ category: cat, views: 1 }])
				}
			}

			await patch.commit()
		} else {
			await client.create({
				_id: today,
				_type: 'analytics.daily',
				date: new Date().toISOString().split('T')[0],
				totalViews: 1,
				uniqueSessions: 1,
				articleViews: [{ _key: slug.substring(0, 32), slug, title, views: 1 }],
				categoryViews: categories.map((cat) => ({ _key: cat, category: cat, views: 1 })),
				searchQueries: [],
				countries: country ? [{ _key: country.substring(0, 32), country, count: 1 }] : [],
				devices: device ? [{ _key: device.substring(0, 32), device, count: 1 }] : [],
			})
		}
	} catch {
		// silently fail in production
	}
}

export async function trackSearch(query: string) {
	try {
		const today = TODAY_ID()
		const existing = await client.fetch<DailyStats | null>(
			groq`*[_id == $id][0]`,
			{ id: today },
		)
		if (existing) {
			const patch = client.patch(today)
			const qIdx = existing.searchQueries?.findIndex((q) => q.query === query)
			if (qIdx >= 0) {
				patch.inc({ [`searchQueries[${qIdx}].count`]: 1 })
			} else {
				patch.insert('after', 'searchQueries[-1]', [{ _key: query.substring(0, 32), query, count: 1 }])
			}
			await patch.commit()
		}
	} catch {
		// silently fail
	}
}

export async function getTodayStats(): Promise<DailyStats | null> {
	return await client.fetch<DailyStats | null>(
		groq`*[_id == $id][0]`,
		{ id: TODAY_ID() },
	)
}

export async function getWeekStats(): Promise<DailyStats[]> {
	const days = Array.from({ length: 7 }, (_, i) => {
		const d = new Date()
		d.setDate(d.getDate() - i)
		return `analytics.${d.toISOString().split('T')[0]}`
	})
	return await client.fetch<DailyStats[]>(
		groq`*[_id in $days]|order(date asc)`,
		{ days },
	)
}

export async function getMonthlyStats(): Promise<DailyStats[]> {
	const days = Array.from({ length: 30 }, (_, i) => {
		const d = new Date()
		d.setDate(d.getDate() - i)
		return `analytics.${d.toISOString().split('T')[0]}`
	})
	return await client.fetch<DailyStats[]>(
		groq`*[_id in $days]|order(date asc)`,
		{ days },
	)
}

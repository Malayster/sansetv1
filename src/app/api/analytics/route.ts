import { createClient } from '@sanity/client'
import { groq } from 'next-sanity'
import { apiVersion, dataset, projectId } from '@/sanity/env'
import { NextResponse } from 'next/server'

const analyticsClient = createClient({
	projectId,
	dataset,
	apiVersion,
	useCdn: false,
	token: process.env.SANITY_API_READ_TOKEN,
})

export async function GET() {
	try {
		// Today's stats
		const today = new Date().toISOString().split('T')[0]
		const todayId = `analytics.${today}`

		// Last 7 days
		const weekDays = Array.from({ length: 7 }, (_, i) => {
			const d = new Date(); d.setDate(d.getDate() - i)
			return `analytics.${d.toISOString().split('T')[0]}`
		})

		// Last 30 days
		const monthDays = Array.from({ length: 30 }, (_, i) => {
			const d = new Date(); d.setDate(d.getDate() - i)
			return `analytics.${d.toISOString().split('T')[0]}`
		})

		const [todayStats, weekStats, monthStats, totalPosts, categories, aiPending, aiPendingList] = await Promise.all([
			analyticsClient.fetch(groq`*[_id == $id][0]{date,totalViews,uniqueSessions,articleViews,categoryViews,searchQueries,countries,devices}`, { id: todayId }),
			analyticsClient.fetch(groq`*[_id in $ids]|order(date asc){date,totalViews,uniqueSessions,categoryViews}`, { ids: weekDays }),
			analyticsClient.fetch(groq`*[_id in $ids]|order(date asc){date,totalViews,uniqueSessions}`, { ids: monthDays }),
			analyticsClient.fetch(groq`count(*[_type == "blog.post" && status in ["published", "approved"]])`),
			analyticsClient.fetch(groq`*[_type == "blog.category"]{title}|order(title asc)`),
				analyticsClient.fetch(groq`count(*[_type == "blog.post" && status == "pending"])`),
				analyticsClient.fetch(groq`*[_type == "blog.post" && status == "pending"]|order(publishDate desc)[0...5]{_id,title,publishDate,categories[]->{title}}`),
		])

		return NextResponse.json({
			today: todayStats || {
				date: today,
				totalViews: 0,
				uniqueSessions: 0,
				articleViews: [],
				categoryViews: [],
				searchQueries: [],
			},
			week: weekStats,
			month: monthStats,
			totalPosts,
			categories: categories.map((c: { title: string }) => c.title),
				aiPending,
				aiPendingList: aiPendingList.map((a: any) => ({
					_id: a._id,
						title: a.title,
					publishDate: a.publishDate,
					categories: (a.categories || []).map((cat: any) => cat.title),
				})),
		})
	} catch (e: unknown) {
		const msg = e instanceof Error ? e.message : 'Unknown error'
		return NextResponse.json({ error: msg }, { status: 500 })
	}
}

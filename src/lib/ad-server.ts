import { client } from '@/sanity/lib/client'
import { groq } from 'next-sanity'
import { unstable_cache } from 'next/cache'

export type AdCampaign = {
	_id: string
	title: string
	client: string
	type: 'banner' | 'sidebar' | 'inline' | 'sticky-footer'
	image: {
		asset: {
			_id: string
			url: string
			metadata: { lqip: string; dimensions: { width: number; height: number } }
		}
	}
	link: string
	startDate: string
	endDate: string
	status: string
	targetCategories: string[] | null
	budget: number | null
	cpm: number | null
	maxImpressions: number | null
	impressions: number
	clicks: number
}

const ACTIVE_ADS_QUERY = groq`*[
  _type == "ad.campaign"
  && status == "active"
  && startDate <= $today
  && endDate >= $today
]|order(cpm desc){
  _id, title, client, type, image{asset->{_id, url, metadata{lqip, dimensions}}},
  link, startDate, endDate, status, targetCategories, budget, cpm, maxImpressions,
  impressions, clicks
}`

async function fetchActiveAds(): Promise<AdCampaign[]> {
	const today = new Date().toISOString().split('T')[0]
	return await client.fetch<AdCampaign[]>(ACTIVE_ADS_QUERY, { today })
}

const cachedAds = unstable_cache(fetchActiveAds, ['active-ad-campaigns'], { revalidate: 60 })

export async function getAd(
	position: string,
	category?: string,
): Promise<AdCampaign | null> {
	const ads = await cachedAds()
	const candidates = ads.filter((ad) => {
		if (ad.type !== position) return false
		if (ad.targetCategories?.length && category) {
			return ad.targetCategories.includes(category)
		}
		return true
	})

	// Check budget/impression limits
	const eligible = candidates.filter((ad) => {
		if (ad.maxImpressions && ad.impressions >= ad.maxImpressions) return false
		if (ad.budget && ad.cpm) {
			const cost = (ad.impressions / 1000) * ad.cpm
			if (cost >= ad.budget) return false
		}
		return true
	})

	if (eligible.length === 0) return null

	// Weighted random — higher CPM = higher probability
	const totalWeight = eligible.reduce((sum, ad) => sum + (ad.cpm || 1), 0)
	let rand = Math.random() * totalWeight

	for (const ad of eligible) {
		rand -= ad.cpm || 1
		if (rand <= 0) return ad
	}

	return eligible[0]
}

export async function trackImpression(campaignId: string) {
	try {
		await client
			.patch(campaignId)
			.inc({ impressions: 1 })
			.commit()
	} catch {}
}

export async function trackClick(campaignId: string) {
	try {
		const doc = await client.fetch<{ budget: number; cpm: number; impressions: number }>(
			groq`*[_id == $id]{budget, cpm, impressions}[0]`,
			{ id: campaignId },
		)
		await client.patch(campaignId).inc({ clicks: 1 }).commit()

		// Auto-pause on budget exhaust
		if (doc?.budget && doc?.cpm && doc?.impressions) {
			const cost = ((doc.impressions + 1) / 1000) * doc.cpm
			if (cost >= doc.budget) {
				await client.patch(campaignId).set({ status: 'completed' }).commit()
			}
		}
	} catch {}
}

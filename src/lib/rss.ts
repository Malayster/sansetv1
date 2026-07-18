import Parser from 'rss-parser'

const parser = new Parser()

export interface FeedArticle {
	title: string
	link: string
	content: string
	contentSnippet: string
	pubDate: string
	source: string
}

export const RSS_FEEDS = [
	{ name: 'Bernama', url: 'https://www.bernama.com/bm/rss' },
	{ name: 'Malaysiakini', url: 'https://www.malaysiakini.com/my/rss' },
	{ name: 'Utusan', url: 'https://www.utusan.com.my/feed' },
	{ name: 'Berita Harian', url: 'https://www.bharian.com.my/rss' },
]

export async function fetchRSSArticles(
	feeds = RSS_FEEDS,
	maxPerFeed = 5,
): Promise<FeedArticle[]> {
	const all: FeedArticle[] = []

	for (const feed of feeds) {
		try {
			const data = await parser.parseURL(feed.url)
			const items = (data.items || []).slice(0, maxPerFeed)
			for (const item of items) {
				all.push({
					title: item.title || 'Tanpa Tajuk',
					link: item.link || '',
					content: item.content || item.contentSnippet || '',
					contentSnippet: item.contentSnippet || '',
					pubDate: item.pubDate || '',
					source: feed.name,
				})
			}
		} catch (e) {
			console.warn(`[RSS] Gagal fetch ${feed.name}: ${e instanceof Error ? e.message : e}`)
		}
	}

	return all
}

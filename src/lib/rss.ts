import Parser from 'rss-parser'

const parser = new Parser()

export interface FeedArticle {
	title: string
	link: string
	content: string
	contentSnippet: string
	pubDate: string
	source: string
	lang: string
}

export const RSS_FEEDS = [
	// 🇲🇾 Bahasa Melayu sources
	{ name: 'Utusan Malaysia', url: 'https://www.utusan.com.my/feed', lang: 'bm' },
	{ name: 'Rakyat Post', url: 'https://therakyatpost.com/feed/', lang: 'bm' },
	{ name: 'Borneo Post BM', url: 'https://www.theborneopost.com/feed/', lang: 'bm' },
	{ name: 'Astro Awani', url: 'https://www.astroawani.com/rss/berita', lang: 'bm' },
	{ name: 'Sinar Harian', url: 'https://www.sinarharian.com.my/rss/terkini.xml', lang: 'bm' },
	{ name: 'Berita Harian', url: 'https://www.bharian.com.my/rss/edisi/malaysia.xml', lang: 'bm' },
	// 🇬🇧 English sources → DeepSeek rewrite ke BM
	{ name: 'Malay Mail', url: 'https://www.malaymail.com/feed/rss', lang: 'en' },
	{ name: 'Free Malaysia Today', url: 'https://www.freemalaysiatoday.com/feed/', lang: 'en' },
	{ name: 'The Sun Daily', url: 'https://thesun.my/rss', lang: 'en' },
	{ name: 'NST', url: 'https://www.nst.com.my/news/nation.rss', lang: 'en' },
	{ name: 'The Star', url: 'https://www.thestar.com.my/rss/News', lang: 'en' },
	{ name: 'The Edge', url: 'https://theedgemarkets.com/feed', lang: 'en' },
	{ name: 'Bernama EN', url: 'https://www.bernama.com/en/rss', lang: 'en' },
]

export async function fetchRSSArticles(
	feeds = RSS_FEEDS,
	maxPerFeed = 8,
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

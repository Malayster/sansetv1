import { groq } from 'next-sanity'
import type { SITE_QUERY_RESULT } from '@/sanity/types'
import {
	LINK_QUERY,
	NAVIGATION_QUERY,
	MODULES_QUERY,
} from '@/sanity/queries'
import { sanityFetchLive } from './live'

/* fragments */

export { LINK_QUERY, NAVIGATION_QUERY, MODULES_QUERY } from '@/sanity/queries'

const SITE_QUERY = groq`*[_type == 'site'][0]{
	...,
	header->{ ${NAVIGATION_QUERY} },
	ctas[]{
		...,
		link{ ${LINK_QUERY} }
	},
	footer->{ ${NAVIGATION_QUERY} },
	social->{ ${NAVIGATION_QUERY} },
}`

export const GLOBAL_MODULE_EXCLUDE_QUERY = groq`
	select(
		defined(excludePaths) => count(excludePaths[string::startsWith($slug, @)]) == 0,
		true
	)
`

export const GLOBAL_MODULE_PATH_QUERY = groq`
	string::startsWith($slug, path)
	&& ${GLOBAL_MODULE_EXCLUDE_QUERY}
`

// @sanity-typegen-ignore
export const BLOG_POST_FRAGMENT_QUERY = groq`
	'readTime': length(string::split(pt::text(content), ' ')) / 200,
	categories[]->{
		title,
		slug
	},
	author->{
		name,
		image{
			...,
			asset->
		}
	}
`


/* queries */

export async function getSite() {
	return await sanityFetchLive<SITE_QUERY_RESULT>({
		query: SITE_QUERY,
	})
}

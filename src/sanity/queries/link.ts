import { groq } from 'next-sanity'

// @sanity-typegen-ignore
export const LINK_QUERY = groq`
	...,
	type == 'internal' => {
		internal->{
			_type,
			title,
			'slug': select(
				metadata.slug.current == 'index' => '/',
				'/' + metadata.slug.current
			)
		}
	}
`

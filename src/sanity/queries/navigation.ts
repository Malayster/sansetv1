import { groq } from 'next-sanity'
import { LINK_QUERY } from './link'

// @sanity-typegen-ignore
export const NAVIGATION_QUERY = groq`
	...,
	items[]{
		${LINK_QUERY},
		defined(link) => { link{ ${LINK_QUERY} } },
		defined(links[]) => { links[]{ ${LINK_QUERY} } },
		_type == 'megamenu' => {
			defined(link) => { link{ ${LINK_QUERY} } },
			items[]{
				...,
				_type == 'link' => { ${LINK_QUERY} },
				_type == 'link.list' => {
					defined(link) => { link{ ${LINK_QUERY} } },
					links[]{ ${LINK_QUERY} }
				},
				_type == 'link.card' => {
					defined(link) => { link{ ${LINK_QUERY} } },
					image{
						...,
						asset->{
							...,
							metadata
						}
					}
				}
			}
		}
	}
`

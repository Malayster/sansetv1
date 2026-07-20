import { groq } from 'next-sanity'
import { LINK_QUERY } from './link'

// @sanity-typegen-ignore
export const SIDEBAR_QUERY = groq`
	...,
	modules[]{
		...,
		_type == 'callout' => {
			ctas[]{
				...,
				link{ ${LINK_QUERY} }
			}
		}
	}
`

// @sanity-typegen-ignore
export const MODULES_QUERY = groq`
	...,
	ctas[]{
		...,
		link{ ${LINK_QUERY} }
	},
	sidebar{ ${SIDEBAR_QUERY} },
	_type == 'form-module' => {
		form->
	},
	_type == 'breadcrumbs' => {
		crumbs[]{ ${LINK_QUERY} }
	},
	_type == 'card-list' => {
		cards[]{
			...,
			ctas[]{
				...,
				link{ ${LINK_QUERY} }
			}
		}
	},
	_type == 'logo-list' => {
		logos[]->
	},
	_type == 'person-list' => {
		people[]->
	},
	_type == 'prose' => {
		content[]{
			...,
			_type == 'image' => {
				...,
				asset->{
					...,
					metadata
				}
			}
		},
		'headings': content[style in ['h2', 'h3', 'h4', 'h5', 'h6']]{
			style,
			'text': pt::text(@)
		}
	},
	_type == 'quote-list' => {
		quotes[]->
	},
	_type == 'tabbed-content' => {
		tabs[]{
			...,
			content[]{
				...,
				_type == 'image' => {
					...,
					asset->{
						...,
						metadata
					}
				}
		},
		ctas[]{
			...,
			link{ ${LINK_QUERY} }
			}
		}
	},
`
